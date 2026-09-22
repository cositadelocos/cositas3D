import * as THREE from "three";

export type ModelPart = {
  id: string;
  name: string;
  count: number;
};

export type TextureAsset = {
  id: string;
  name: string;
  slot: string;
  dataUrl: string;
  width: number;
  height: number;
};

export type MaterialAsset = {
  id: string;
  name: string;
  type: string;
  color: string;
  metalness: number | null;
  roughness: number | null;
  maps: { slot: string; textureId: string }[];
};

export type InspectReport = {
  parts: ModelPart[];
  textures: TextureAsset[];
  materials: MaterialAsset[];
};

const SLOT_LABEL: Record<string, string> = {
  map: "Albedo / UV",
  roughnessMap: "Rugosidad",
  metalnessMap: "Metalness",
  normalMap: "Normal",
  aoMap: "AO",
  emissiveMap: "Emisivo",
  bumpMap: "Bump",
  displacementMap: "Desplazamiento",
  alphaMap: "Alpha",
};

function prettyName(raw: string, fallback: string) {
  const trimmed = raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return trimmed || fallback;
}

function findPartName(obj: THREE.Object3D): string {
  let current: THREE.Object3D | null = obj;
  while (current) {
    if (current.name) return current.name;
    current = current.parent;
  }
  return "";
}

function drawTexture(tex: THREE.Texture): { dataUrl: string; width: number; height: number } | null {
  const image = tex.image as
    | HTMLImageElement
    | HTMLCanvasElement
    | ImageBitmap
    | ImageData
    | { data: ArrayBufferView; width: number; height: number }
    | undefined;
  if (!image) return null;

  const width = "width" in image ? Number(image.width) : 0;
  const height = "height" in image ? Number(image.height) : 0;
  if (!width || !height || width > 8192 || height > 8192) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  try {
    if (image instanceof ImageData) {
      ctx.putImageData(image, 0, 0);
    } else if ("data" in image && !(image instanceof HTMLImageElement) && !(image instanceof HTMLCanvasElement)) {
      const src = (image as { data: ArrayBufferView }).data;
      const arr = new Uint8ClampedArray(src.byteLength);
      arr.set(new Uint8Array(src.buffer, src.byteOffset, src.byteLength));
      if (arr.length < width * height * 4) return null;
      ctx.putImageData(new ImageData(arr, width, height), 0, 0);
    } else {
      ctx.drawImage(image as CanvasImageSource, 0, 0);
    }
    return { dataUrl: canvas.toDataURL("image/png"), width, height };
  } catch {
    return null;
  }
}

function collectMaps(mat: THREE.MeshStandardMaterial) {
  const slots: { slot: string; tex: THREE.Texture }[] = [];
  const maybe: [string, THREE.Texture | null | undefined][] = [
    ["map", mat.map],
    ["roughnessMap", mat.roughnessMap],
    ["metalnessMap", mat.metalnessMap],
    ["normalMap", mat.normalMap],
    ["aoMap", mat.aoMap],
    ["emissiveMap", mat.emissiveMap],
    ["bumpMap", mat.bumpMap],
    ["displacementMap", mat.displacementMap],
    ["alphaMap", mat.alphaMap],
  ];
  for (const [slot, tex] of maybe) {
    if (tex) slots.push({ slot, tex });
  }
  return slots;
}

export function inspectModel(root: THREE.Object3D): InspectReport {
  const partBuckets = new Map<string, { name: string; meshes: THREE.Mesh[] }>();
  const textures = new Map<string, TextureAsset>();
  const materials = new Map<string, MaterialAsset>();
  let unnamed = 0;

  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;

    const rawName = findPartName(mesh);
    unnamed += rawName ? 0 : 1;
    const name = prettyName(rawName, `Pieza ${unnamed || 1}`);
    const bucketId = rawName ? `n:${rawName}` : `m:${mesh.uuid}`;
    const bucket = partBuckets.get(bucketId) ?? { name, meshes: [] };
    bucket.meshes.push(mesh);
    partBuckets.set(bucketId, bucket);
    mesh.userData.partId = bucketId;

    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const raw of mats) {
      if (!raw) continue;
      const mat = raw as THREE.MeshStandardMaterial;
      if (materials.has(mat.uuid)) continue;

      const maps: { slot: string; textureId: string }[] = [];
      for (const { slot, tex } of collectMaps(mat)) {
        const id = tex.uuid;
        if (!textures.has(id)) {
          const drawn = drawTexture(tex);
          if (!drawn) continue;
          textures.set(id, {
            id,
            name: tex.name || SLOT_LABEL[slot] || slot,
            slot: SLOT_LABEL[slot] ?? slot,
            dataUrl: drawn.dataUrl,
            width: drawn.width,
            height: drawn.height,
          });
        }
        if (textures.has(id)) maps.push({ slot: SLOT_LABEL[slot] ?? slot, textureId: id });
      }

      const color =
        "color" in mat && mat.color instanceof THREE.Color ? `#${mat.color.getHexString()}` : "#888888";

      materials.set(mat.uuid, {
        id: mat.uuid,
        name: prettyName(mat.name, "Material"),
        type: mat.type.replace("Material", ""),
        color,
        metalness: "metalness" in mat ? mat.metalness : null,
        roughness: "roughness" in mat ? mat.roughness : null,
        maps,
      });
    }
  });

  return {
    parts: [...partBuckets.entries()].map(([id, bucket]) => ({
      id,
      name: bucket.name,
      count: bucket.meshes.length,
    })),
    textures: [...textures.values()],
    materials: [...materials.values()],
  };
}

export function applyPartVisibility(root: THREE.Object3D, hiddenIds: string[]) {
  const hidden = new Set(hiddenIds);
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const partId = mesh.userData.partId as string | undefined;
    if (!partId) return;
    mesh.visible = !hidden.has(partId);
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function downloadJson(value: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}
