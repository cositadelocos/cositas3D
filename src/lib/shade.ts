import * as THREE from "three";

export type ShadeMode = "mesh" | "solid" | "material";

export const SHADE_MODES: { id: ShadeMode; label: string }[] = [
  { id: "mesh", label: "Malla" },
  { id: "solid", label: "Sólido" },
  { id: "material", label: "Material" },
];

type ShadeSnap = {
  wireframe: boolean;
  color: THREE.Color;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  map: THREE.Texture | null;
  roughnessMap: THREE.Texture | null;
  metalnessMap: THREE.Texture | null;
  normalMap: THREE.Texture | null;
  envMapIntensity?: number;
  emissive?: THREE.Color;
  emissiveIntensity?: number;
};

type Shadable = THREE.MeshStandardMaterial & {
  userData: { shadeSnap?: ShadeSnap; shaded?: boolean };
};

function snapshot(mat: Shadable) {
  if (mat.userData.shadeSnap) return;
  mat.userData.shadeSnap = {
    wireframe: mat.wireframe,
    color: mat.color.clone(),
    metalness: mat.metalness,
    roughness: mat.roughness,
    clearcoat: "clearcoat" in mat ? (mat as THREE.MeshPhysicalMaterial).clearcoat : undefined,
    map: mat.map,
    roughnessMap: mat.roughnessMap,
    metalnessMap: mat.metalnessMap,
    normalMap: mat.normalMap,
    envMapIntensity: mat.envMapIntensity,
    emissive: mat.emissive?.clone(),
    emissiveIntensity: mat.emissiveIntensity,
  };
}

function restore(mat: Shadable) {
  const snap = mat.userData.shadeSnap;
  if (!snap) return;
  mat.wireframe = snap.wireframe;
  mat.color.copy(snap.color);
  if (snap.metalness != null) mat.metalness = snap.metalness;
  if (snap.roughness != null) mat.roughness = snap.roughness;
  if (snap.clearcoat != null && "clearcoat" in mat) {
    (mat as THREE.MeshPhysicalMaterial).clearcoat = snap.clearcoat;
  }
  mat.map = snap.map;
  mat.roughnessMap = snap.roughnessMap;
  mat.metalnessMap = snap.metalnessMap;
  mat.normalMap = snap.normalMap;
  if (snap.envMapIntensity != null) mat.envMapIntensity = snap.envMapIntensity;
  if (mat.emissive && snap.emissive) mat.emissive.copy(snap.emissive);
  if (snap.emissiveIntensity != null) mat.emissiveIntensity = snap.emissiveIntensity;
}

export function applyShade(root: THREE.Object3D, mode: ShadeMode, meshColor = "#dce1e8") {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      if (!("color" in raw) || !(raw.color instanceof THREE.Color)) continue;
      const mat = raw as Shadable;
      if (mode === "material") {
        if (mat.userData.shaded) restore(mat);
        mat.userData.shaded = false;
        mat.userData.shadeSnap = undefined;
      } else {
        if (!mat.userData.shaded) snapshot(mat);
        if (mode === "solid") {
          mat.wireframe = false;
          mat.color.set("#c7c3bb");
          if ("metalness" in mat) mat.metalness = 0;
          if ("roughness" in mat) mat.roughness = 0.92;
          if ("clearcoat" in mat) (mat as THREE.MeshPhysicalMaterial).clearcoat = 0;
          mat.map = null;
          mat.roughnessMap = null;
          mat.metalnessMap = null;
          mat.normalMap = null;
          mat.envMapIntensity = 0.22;
          if (mat.emissive) mat.emissive.set("#000000");
          mat.emissiveIntensity = 0;
        } else {
          mat.wireframe = true;
          mat.color.set(meshColor);
          if ("metalness" in mat) mat.metalness = 0;
          if ("roughness" in mat) mat.roughness = 1;
          if ("clearcoat" in mat) (mat as THREE.MeshPhysicalMaterial).clearcoat = 0;
          mat.map = null;
          mat.roughnessMap = null;
          mat.metalnessMap = null;
          mat.normalMap = null;
          mat.envMapIntensity = 0;
          if (mat.emissive) mat.emissive.copy(mat.color);
          mat.emissiveIntensity = 0.4;
        }
        mat.userData.shaded = true;
      }
      mat.needsUpdate = true;
    }
  });
}
