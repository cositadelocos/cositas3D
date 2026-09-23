export const ACCEPTED_MODEL_EXT = ["glb", "gltf", "fbx", "obj", "stl", "3ds"] as const;
export type ModelFormat = (typeof ACCEPTED_MODEL_EXT)[number];

export const ACCEPT_ATTR =
  ".glb,.gltf,.fbx,.obj,.stl,.3ds,model/gltf-binary,model/gltf+json,application/octet-stream";
export const MAX_MODEL_BYTES = 50 * 1024 * 1024;

const PRIMARY_ORDER: ModelFormat[] = ["glb", "gltf", "fbx", "obj", "stl", "3ds"];

const NATIVE_HINT: Record<string, string> = {
  f3d: "El .f3d de Fusion 360 no se abre aquí. En Fusion: Archivo → Exportar → FBX o glTF (.glb).",
  f3z: "Ese paquete de Fusion no se abre aquí. Exporta FBX o GLB.",
  max: "El .max de 3ds Max no se abre aquí. Exporta FBX, GLB, OBJ o STL.",
  step: "STEP no se puede ver en el navegador. Desde Fusion exporta STL, FBX o GLB.",
  stp: "STEP no se puede ver en el navegador. Desde Fusion exporta STL, FBX o GLB.",
  iges: "IGES no se puede ver en el navegador. Exporta STL, FBX o GLB.",
  igs: "IGES no se puede ver en el navegador. Exporta STL, FBX o GLB.",
  sldprt: "Ese sólido de CAD no se abre aquí. Exporta STL, FBX o GLB.",
  blend: "El .blend ábrelo en Blender y exporta GLB.",
};

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

  const native = list.find((file) => NATIVE_HINT[fileExt(file.name)]);
  if (native && !list.some((file) => isModelFormat(fileExt(file.name)))) {
    return { ok: false, error: NATIVE_HINT[fileExt(native.name)] ?? "Formato no compatible." };
  }

  const primary = PRIMARY_ORDER.map((ext) => list.find((file) => fileExt(file.name) === ext)).find(Boolean);
  if (!primary) {
    return {
      ok: false,
      error: "Formato no compatible. Sube GLB, FBX, OBJ, STL o 3DS. Fusion y 3ds Max: exporta, no subas el archivo nativo.",
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
    case "fbx":
      return "FBX";
    case "3ds":
      return "3DS";
  }
}
