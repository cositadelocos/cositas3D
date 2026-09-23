import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { TDSLoader } from "three/examples/jsm/loaders/TDSLoader.js";
import { getFinish } from "@/lib/finishes";
import type { ModelFormat } from "@/lib/model-files";
import { useViewer } from "@/lib/viewer-store";

const TARGET_SIZE = 2.32;
const FLOOR_Y = -0.48;
const DRACO_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _center = new THREE.Vector3();

function measureAndCenter(content: THREE.Object3D) {
  content.updateMatrixWorld(true);
  _box.setFromObject(content);
  if (_box.isEmpty()) return null;
  _box.getSize(_size);
  _box.getCenter(_center);
  content.position.x -= _center.x;
  content.position.z -= _center.z;
  content.position.y -= _box.min.y;
  return { x: _size.x, y: _size.y, z: _size.z };
}

function applyViewFit(view: THREE.Object3D, size: { x: number; y: number; z: number }, frame: number) {
  const maxDim = Math.max(size.x, size.y, size.z, 1e-4);
  view.scale.setScalar((TARGET_SIZE / maxDim) * (frame / 100));
  view.position.set(0, FLOOR_Y, 0);
}

function toMillimeters(root: THREE.Object3D, format: ModelFormat) {
  let factor = 1;
  if (format === "glb" || format === "gltf") {
    factor = 1000;
  } else if (format === "fbx") {
    const raw = Number(root.userData.unitScaleFactor);
    const unitScale = Number.isFinite(raw) && raw > 0 ? raw : 1;
    factor = 10 / unitScale;
  }
  if (Math.abs(factor - 1) > 1e-8) root.scale.multiplyScalar(factor);
  root.updateMatrixWorld(true);
}

function prepareMeshes(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (mesh.geometry && !mesh.geometry.getAttribute("normal")) {
      mesh.geometry.computeVertexNormals();
    }
  });
}

function disposeObject(root: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry?.dispose();
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      for (const value of Object.values(mat)) {
        if (value instanceof THREE.Texture) textures.add(value);
      }
      mat.dispose();
    }
  });
  for (const texture of textures) texture.dispose();
}

type OrigPbr = {
  color: THREE.Color;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  envMapIntensity?: number;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
  toneMapped?: boolean;
};

function applyFinish(root: THREE.Object3D, finishId: string) {
  const finish = finishId === "original" ? null : getFinish(finishId);
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (!("color" in mat) || !(mat.color instanceof THREE.Color)) continue;
      const record = mat as THREE.MeshPhysicalMaterial & { userData: { origPbr?: OrigPbr } };
      if (!record.userData.origPbr) {
        record.userData.origPbr = {
          color: record.color.clone(),
          metalness: record.metalness,
          roughness: record.roughness,
          clearcoat: record.clearcoat,
          clearcoatRoughness: record.clearcoatRoughness,
          envMapIntensity: record.envMapIntensity,
          emissive: record.emissive?.clone(),
          emissiveIntensity: record.emissiveIntensity,
          toneMapped: record.toneMapped,
        };
      }
      const orig = record.userData.origPbr;
      if (!finish) {
        record.color.copy(orig.color);
        if (orig.metalness != null) record.metalness = orig.metalness;
        if (orig.roughness != null) record.roughness = orig.roughness;
        if (orig.clearcoat != null) record.clearcoat = orig.clearcoat;
        if (orig.clearcoatRoughness != null) record.clearcoatRoughness = orig.clearcoatRoughness;
        if (orig.envMapIntensity != null) record.envMapIntensity = orig.envMapIntensity;
        if (orig.emissive && record.emissive) record.emissive.copy(orig.emissive);
        if (orig.emissiveIntensity != null) record.emissiveIntensity = orig.emissiveIntensity;
        if (orig.toneMapped != null) record.toneMapped = orig.toneMapped;
      } else {
        record.color.set(finish.metal);
        if ("metalness" in record) record.metalness = finish.metalness;
        if ("roughness" in record) record.roughness = finish.roughness;
        if ("clearcoat" in record) record.clearcoat = finish.clearcoat;
        if ("clearcoatRoughness" in record) record.clearcoatRoughness = finish.clearcoatRoughness;
        if ("envMapIntensity" in record) record.envMapIntensity = finish.envMapIntensity;
        if (record.emissive) {
          record.emissive.set(finish.emissive);
          record.emissiveIntensity = finish.emissiveIntensity;
        }
        record.toneMapped = finish.emissiveIntensity < 1;
      }
      record.needsUpdate = true;
    }
  });
}

function createManager(extras: Record<string, string> | null) {
  const manager = new THREE.LoadingManager();
  if (extras) {
    manager.setURLModifier((url) => {
      const name = url.split(/[?#]/)[0]?.split("/").pop()?.toLowerCase();
      if (name && extras[name]) return extras[name];
      return url;
    });
  }
  return manager;
}

function loadRoot(
  url: string,
  format: ModelFormat,
  extras: Record<string, string> | null,
): Promise<THREE.Object3D> {
  const manager = createManager(extras);

  if (format === "stl") {
    const loader = new STLLoader(manager);
    return loader.loadAsync(url).then((geometry) => {
      geometry.computeVertexNormals();
      const material = new THREE.MeshPhysicalMaterial({
        color: "#c5cad2",
        metalness: 0.7,
        roughness: 0.35,
        clearcoat: 0.2,
      });
      return new THREE.Mesh(geometry, material);
    });
  }

  if (format === "obj") {
    const loader = new OBJLoader(manager);
    return loader.loadAsync(url);
  }

  if (format === "fbx") {
    const loader = new FBXLoader(manager);
    return loader.loadAsync(url);
  }

  if (format === "3ds") {
    const loader = new TDSLoader(manager);
    return loader.loadAsync(url);
  }

  const loader = new GLTFLoader(manager);
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_PATH);
  loader.setDRACOLoader(draco);
  return loader.loadAsync(url).then((gltf) => {
    draco.dispose();
    return gltf.scene;
  });
}

export function LoadedModel({
  url,
  format,
  extras,
  finishId,
}: {
  url: string;
  format: ModelFormat;
  extras: Record<string, string> | null;
  finishId: string;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const objectRef = useRef<THREE.Object3D | null>(null);
  const sizeRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const setModelStatus = useViewer((s) => s.setModelStatus);
  const setSourceSize = useViewer((s) => s.setSourceSize);
  const resetCamera = useViewer((s) => s.resetCamera);
  const frame = useViewer((s) => s.frame);

  useEffect(() => {
    let cancelled = false;
    setModelStatus("loading");

    loadRoot(url, format, extras)
      .then((root) => {
        if (cancelled) {
          disposeObject(root);
          return;
        }
        prepareMeshes(root);
        toMillimeters(root, format);
        const source = new THREE.Group();
        source.userData.exportSource = true;
        source.add(root);
        const size = measureAndCenter(source);
        sizeRef.current = size;
        const view = groupRef.current;
        if (view) {
          view.add(source);
          if (size) applyViewFit(view, size, useViewer.getState().frame);
        }
        applyFinish(root, useViewer.getState().finishId);
        objectRef.current = source;
        setSourceSize(size);
        setModelStatus("ready");
        resetCamera();
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "No se pudo leer el modelo.";
        const hint =
          format === "gltf"
            ? " Un .gltf suelto necesita sus .bin y texturas. Exporta un GLB (un solo archivo)."
            : format === "fbx"
              ? " Si el FBX falla, expórtalo otra vez como GLB (glTF 2.0)."
              : " Desde Fusion o 3ds Max exporta GLB o FBX.";
        setModelStatus("error", message + hint);
      });

    return () => {
      cancelled = true;
      const current = objectRef.current;
      if (current) {
        current.removeFromParent();
        disposeObject(current);
        objectRef.current = null;
      }
    };
  }, [url, format, extras, setModelStatus, setSourceSize, resetCamera]);

  useEffect(() => {
    const view = groupRef.current;
    const size = sizeRef.current;
    if (view && size) applyViewFit(view, size, frame);
  }, [frame]);

  useEffect(() => {
    const current = objectRef.current;
    if (current) applyFinish(current, finishId);
  }, [finishId]);

  return <group ref={groupRef} />;
}
