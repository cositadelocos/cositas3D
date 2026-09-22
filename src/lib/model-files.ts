export const ACCEPTED_MODEL_EXT = ["glb", "gltf", "obj", "stl"] as const;
export type ModelFormat = (typeof ACCEPTED_MODEL_EXT)[number];

export const ACCEPT_ATTR = ".glb,.gltf,.obj,.stl,model/gltf-binary,model/gltf+json";
export const MAX_MODEL_BYTES = 50 * 1024 * 1024;

const PRIMARY_ORDER: ModelFormat[] = ["glb", "gltf", "obj", "stl"];

export function fileExt(name: string): string {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() ?? "") : "";
}

export function isModelFormat(ext: string): ext is ModelFormat {
  return (ACCEPTED_MODEL_EXT as readonly string[]).includes(ext);
}

export type ClassifiedModel = {
  primary: File;
  format: ModelFormat;
  extras: File[];
};

export function classifyModelFiles(files: File[]): { ok: true; value: ClassifiedModel } | { ok: false; error: string } {
  const list = files.filter((file) => file.size > 0);
  if (list.length === 0) {
    return { ok: false, error: "No se encontró ningún archivo." };
  }

  const primary = PRIMARY_ORDER.map((ext) => list.find((file) => fileExt(file.name) === ext)).find(Boolean);
  if (!primary) {
    return {
      ok: false,
      error: "Formato no compatible. Sube un .glb (recomendado), .gltf, .obj o .stl.",
    };
  }
  if (primary.size > MAX_MODEL_BYTES) {
    return { ok: false, error: "El archivo supera 50 MB. Exporta un GLB más ligero." };
  }

  const format = fileExt(primary.name) as ModelFormat;
  const extras = list.filter((file) => file !== primary);
  return { ok: true, value: { primary, format, extras } };
}

export function formatLabel(format: ModelFormat) {
  switch (format) {
    case "glb":
      return "GLB";
    case "gltf":
      return "glTF";
    case "obj":
      return "OBJ";
    case "stl":
      return "STL";
  }
}
