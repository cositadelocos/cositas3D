import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { getFinish } from "@/lib/finishes";
import type { ModelFormat } from "@/lib/model-files";
import { useViewer } from "@/lib/viewer-store";

const TARGET_SIZE = 2.32;
const FLOOR_Y = -0.48;
const DRACO_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.7/";

const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _center = new THREE.Vector3();

function fitToStudio(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  _box.setFromObject(root);
  if (_box.isEmpty()) return;
  _box.getSize(_size);
  const maxDim = Math.max(_size.x, _size.y, _size.z, 1e-4);
  root.scale.multiplyScalar(TARGET_SIZE / maxDim);
  root.updateMatrixWorld(true);
  _box.setFromObject(root);
  _box.getCenter(_center);
  root.position.x -= _center.x;
  root.position.z -= _center.z;
  root.position.y -= _box.min.y;
  root.position.y += FLOOR_Y;
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
        };
      }
      const orig = record.userData.origPbr;
      if (!finish) {
        record.color.copy(orig.color);
        if (orig.metalness != null) record.metalness = orig.metalness;
        if (orig.roughness != null) record.roughness = orig.roughness;
        if (orig.clearcoat != null) record.clearcoat = orig.clearcoat;
      } else {
        record.color.set(finish.metal);
        if ("metalness" in record) record.metalness = finish.metalness;
        if ("roughness" in record) record.roughness = finish.roughness;
        if ("clearcoat" in record) record.clearcoat = finish.clearcoat;
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
  const setModelStatus = useViewer((s) => s.setModelStatus);
  const resetCamera = useViewer((s) => s.resetCamera);

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
        fitToStudio(root);
        applyFinish(root, useViewer.getState().finishId);
        const group = groupRef.current;
        if (group) group.add(root);
        objectRef.current = root;
        setModelStatus("ready");
        resetCamera();
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "No se pudo leer el modelo.";
        const hint =
          format === "gltf"
            ? " Un .gltf suelto necesita sus .bin y texturas. Exporta un GLB (un solo archivo)."
            : " Exporta desde Blender: File → Export → glTF 2.0 (.glb).";
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
  }, [url, format, extras, setModelStatus, resetCamera]);

  useEffect(() => {
    const current = objectRef.current;
    if (current) applyFinish(current, finishId);
  }, [finishId]);

  return <group ref={groupRef} />;
}
