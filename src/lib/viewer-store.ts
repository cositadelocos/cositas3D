import { create } from "zustand";
import { DEMO_OBJECT_NAME } from "@/lib/brand";
import type { ViewFace } from "@/lib/camera";
import type { MaterialAsset, ModelPart, TextureAsset } from "@/lib/inspect";
import { classifyModelFiles, type ModelFormat } from "@/lib/model-files";
import { SCENES, type SceneId } from "@/lib/scenes";
import type { ShadeMode } from "@/lib/shade";

export const LIGHT_PRESETS = {
  estudio: { label: "Estudio", note: "Tres puntos suaves", intensity: 0.86, warmth: 0.26, env: 0.7 },
  beauty: { label: "Beauty", note: "Frente amplio, poca sombra", intensity: 0.8, warmth: 0.2, env: 0.85 },
  drama: { label: "Drama", note: "Un foco duro y un borde", intensity: 0.95, warmth: 0.18, env: 0.22 },
  contraluz: { label: "Contraluz", note: "Luz atrás, el borde brilla", intensity: 0.9, warmth: 0.15, env: 0.28 },
  ventana: { label: "Ventana", note: "Lateral fría, como un día nublado", intensity: 0.78, warmth: 0.12, env: 0.95 },
  geles: { label: "Geles", note: "Cian de un lado, magenta del otro", intensity: 0.9, warmth: 0.2, env: 0.35 },
  neon: { label: "Neón", note: "Verde y violeta bajos", intensity: 0.88, warmth: 0.1, env: 0.25 },
  atardecer: { label: "Atardecer", note: "Sol bajo y una sombra larga", intensity: 0.84, warmth: 0.7, env: 0.4 },
  nocturna: { label: "Nocturna", note: "Casi a oscuras, un recorte", intensity: 1, warmth: 0.08, env: 0.12 },
  anillo: { label: "Anillo", note: "Luz pareja alrededor del objeto", intensity: 0.74, warmth: 0.22, env: 0.8 },
} as const;

export type LightPresetId = keyof typeof LIGHT_PRESETS;
export type ModelKind = "demo" | "file";
export type ModelStatus = "idle" | "loading" | "ready" | "error";
export type AnimMode = "none" | "turntable" | "oscillate" | "hopspin";
export type ExportFormat = "glb" | "gltf" | "stl" | "obj";
export type CaptureFormat = "png" | "jpeg";
export type CaptureLook = "vista" | "plano";
export type CaptureSize = "vista" | "2k" | "4k";
export type SourceSize = { x: number; y: number; z: number };
export type ExplodeAxis = "x" | "y" | "z";

export const ANIM_MODES: { id: AnimMode; label: string }[] = [
  { id: "none", label: "Quieto" },
  { id: "turntable", label: "Plato" },
  { id: "oscillate", label: "Oscilar" },
  { id: "hopspin", label: "Saltar" },
];

export const DEFAULT_ZOOM = 56;
export const DEFAULT_MESH_COLOR = "#dce1e8";

export const EXPORT_FORMATS: { id: ExportFormat; label: string; hint: string }[] = [
  { id: "glb", label: "GLB", hint: "Modelo con materiales. El más útil." },
  { id: "gltf", label: "glTF", hint: "El mismo estándar, en JSON." },
  { id: "stl", label: "STL", hint: "Solo malla, para impresión." },
  { id: "obj", label: "OBJ", hint: "Malla clásica, sin texturas." },
];

export const CAPTURE_SIZES: { id: CaptureSize; label: string }[] = [
  { id: "vista", label: "Vista" },
  { id: "2k", label: "2K" },
  { id: "4k", label: "4K" },
];

function revokeUrls(url: string | null, extras: Record<string, string> | null) {
  if (url) URL.revokeObjectURL(url);
  if (extras) {
    for (const extra of Object.values(extras)) URL.revokeObjectURL(extra);
  }
}

type ViewerState = {
  finishId: string;
  zoom: number;
  intensity: number;
  warmth: number;
  env: number;
  preset: LightPresetId;
  sceneId: SceneId | "custom";
  sceneColor: string;
  shadeMode: ShadeMode;
  meshColor: string;
  animMode: AnimMode;
  viewFace: ViewFace | "orbit";
  viewToken: number;
  resetToken: number;
  captureToken: number;
  capturedAt: number;
  captureFormat: CaptureFormat;
  captureLook: CaptureLook;
  captureSize: CaptureSize;
  capturePreview: { url: string; filename: string; mime: string } | null;
  explode: number;
  explodeAxes: Record<ExplodeAxis, boolean>;
  lift: number;
  showFloor: boolean;
  exportToken: number;
  exportFormat: ExportFormat;
  exportNote: string | null;
  modelKind: ModelKind;
  modelName: string;
  modelFormat: ModelFormat | null;
  modelUrl: string | null;
  modelExtras: Record<string, string> | null;
  modelStatus: ModelStatus;
  modelError: string | null;
  modelBytes: number | null;
  sourceSize: SourceSize | null;
  frame: number;
  parts: ModelPart[];
  hiddenPartIds: string[];
  textures: TextureAsset[];
  materials: MaterialAsset[];
  setFinish: (id: string) => void;
  setZoom: (value: number) => void;
  setIntensity: (value: number) => void;
  setWarmth: (value: number) => void;
  setEnv: (value: number) => void;
  setPreset: (preset: LightPresetId) => void;
  setScene: (id: SceneId) => void;
  setSceneColor: (color: string) => void;
  setShadeMode: (mode: ShadeMode) => void;
  setMeshColor: (color: string) => void;
  setAnimMode: (mode: AnimMode) => void;
  snapView: (face: ViewFace) => void;
  resetCamera: () => void;
  requestCapture: () => void;
  markCaptured: () => void;
  setCapturePreview: (preview: { url: string; filename: string; mime: string } | null) => void;
  setCaptureFormat: (format: CaptureFormat) => void;
  setCaptureLook: (look: CaptureLook) => void;
  setCaptureSize: (size: CaptureSize) => void;
  setExplode: (value: number) => void;
  setLift: (value: number) => void;
  setShowFloor: (value: boolean) => void;
  toggleExplodeAxis: (axis: ExplodeAxis) => void;
  requestExport: (format: ExportFormat) => void;
  setExportNote: (note: string | null) => void;
  loadModelFromFiles: (files: File[]) => void;
  setModelStatus: (status: ModelStatus, error?: string | null) => void;
  setSourceSize: (size: SourceSize | null) => void;
  setFrame: (value: number) => void;
  setInspect: (report: { parts: ModelPart[]; textures: TextureAsset[]; materials: MaterialAsset[] }) => void;
  togglePart: (id: string) => void;
  setAllPartsVisible: (visible: boolean) => void;
  restoreDemo: () => void;
};

const emptyInspect = { parts: [] as ModelPart[], textures: [] as TextureAsset[], materials: [] as MaterialAsset[] };

export const useViewer = create<ViewerState>((set, get) => ({
  finishId: "original",
  zoom: DEFAULT_ZOOM,
  intensity: LIGHT_PRESETS.estudio.intensity,
  warmth: LIGHT_PRESETS.estudio.warmth,
  env: LIGHT_PRESETS.estudio.env,
  preset: "estudio",
  sceneId: "noche",
  sceneColor: SCENES[0]!.background,
  shadeMode: "material",
  meshColor: DEFAULT_MESH_COLOR,
  animMode: "turntable",
  viewFace: "orbit",
  viewToken: 0,
  resetToken: 0,
  captureToken: 0,
  capturedAt: 0,
  captureFormat: "png",
  captureLook: "vista",
  captureSize: "2k",
  capturePreview: null,
  explode: 0,
  explodeAxes: { x: true, y: true, z: true },
  lift: 0,
  showFloor: true,
  exportToken: 0,
  exportFormat: "glb",
  exportNote: null,
  modelKind: "demo",
  modelName: DEMO_OBJECT_NAME,
  modelFormat: null,
  modelUrl: null,
  modelExtras: null,
  modelStatus: "idle",
  modelError: null,
  modelBytes: null,
  sourceSize: null,
  frame: 100,
  parts: [],
  hiddenPartIds: [],
  textures: [],
  materials: [],
  setFinish: (finishId) => set({ finishId }),
  setZoom: (zoom) => set({ zoom }),
  setIntensity: (intensity) => set({ intensity }),
  setWarmth: (warmth) => set({ warmth }),
  setEnv: (env) => set({ env }),
  setPreset: (preset) =>
    set({
      preset,
      intensity: LIGHT_PRESETS[preset].intensity,
      warmth: LIGHT_PRESETS[preset].warmth,
      env: LIGHT_PRESETS[preset].env,
    }),
  setScene: (sceneId) => {
    const scene = SCENES.find((item) => item.id === sceneId) ?? SCENES[0]!;
    set({ sceneId, sceneColor: scene.background });
  },
  setSceneColor: (sceneColor) => set({ sceneColor, sceneId: "custom" }),
  setShadeMode: (shadeMode) => set({ shadeMode }),
  setMeshColor: (meshColor) => set({ meshColor, shadeMode: "mesh" }),
  setAnimMode: (animMode) => set({ animMode }),
  snapView: (viewFace) => set((state) => ({ viewFace, viewToken: state.viewToken + 1, animMode: "none" })),
  resetCamera: () =>
    set((state) => ({
      resetToken: state.resetToken + 1,
      zoom: DEFAULT_ZOOM,
      viewFace: "orbit",
    })),
  requestCapture: () => set((state) => ({ captureToken: state.captureToken + 1 })),
  markCaptured: () => set({ capturedAt: Date.now() }),
  setCapturePreview: (capturePreview) => {
    const prev = get().capturePreview;
    if (prev?.url.startsWith("blob:")) URL.revokeObjectURL(prev.url);
    set({ capturePreview, capturedAt: capturePreview ? Date.now() : get().capturedAt });
  },
  setCaptureFormat: (captureFormat) => set({ captureFormat }),
  setCaptureLook: (captureLook) => set({ captureLook }),
  setCaptureSize: (captureSize) => set({ captureSize }),
  setExplode: (explode) => set({ explode }),
  setLift: (lift) => set({ lift }),
  setShowFloor: (showFloor) => set({ showFloor }),
  toggleExplodeAxis: (axis) =>
    set((state) => ({
      explodeAxes: { ...state.explodeAxes, [axis]: !state.explodeAxes[axis] },
    })),
  requestExport: (exportFormat) =>
    set((state) => ({
      exportFormat,
      exportNote: "Exportando…",
      exportToken: state.exportToken + 1,
    })),
  setExportNote: (exportNote) => set({ exportNote }),
  loadModelFromFiles: (files) => {
    const classified = classifyModelFiles(files);
    if (!classified.ok) {
      const tooHeavy = classified.error.includes("El límite es 50 MB");
      set(tooHeavy ? { modelError: classified.error } : { modelStatus: "error", modelError: classified.error });
      return;
    }

    const { primary, format, extras } = classified.value;
    const prev = get();
    revokeUrls(prev.modelUrl, prev.modelExtras);

    const extraUrls: Record<string, string> = {};
    for (const extra of extras) {
      extraUrls[extra.name.toLowerCase()] = URL.createObjectURL(extra);
    }

    set({
      modelKind: "file",
      modelName: primary.name.replace(/\.[^.]+$/, ""),
      modelFormat: format,
      modelUrl: URL.createObjectURL(primary),
      modelExtras: Object.keys(extraUrls).length ? extraUrls : null,
      modelStatus: "loading",
      modelError: null,
      modelBytes: primary.size,
      finishId: "original",
      shadeMode: "material",
      hiddenPartIds: [],
      explode: 0,
      lift: 0,
      frame: 100,
      sourceSize: null,
      ...emptyInspect,
    });
  },
  setModelStatus: (modelStatus, modelError = null) => set({ modelStatus, modelError }),
  setSourceSize: (sourceSize) => set({ sourceSize }),
  setFrame: (frame) => set({ frame }),
  setInspect: ({ parts, textures, materials }) => set({ parts, textures, materials }),
  togglePart: (id) =>
    set((state) => ({
      hiddenPartIds: state.hiddenPartIds.includes(id)
        ? state.hiddenPartIds.filter((item) => item !== id)
        : [...state.hiddenPartIds, id],
    })),
  setAllPartsVisible: (visible) =>
    set((state) => ({ hiddenPartIds: visible ? [] : state.parts.map((part) => part.id) })),
  restoreDemo: () => {
    const prev = get();
    revokeUrls(prev.modelUrl, prev.modelExtras);
    set({
      modelKind: "demo",
      modelName: DEMO_OBJECT_NAME,
      modelFormat: null,
      modelUrl: null,
      modelExtras: null,
      modelStatus: "idle",
      modelError: null,
      finishId: "original",
      shadeMode: "material",
      resetToken: prev.resetToken + 1,
      zoom: DEFAULT_ZOOM,
      viewFace: "orbit",
      hiddenPartIds: [],
      explode: 0,
      lift: 0,
      frame: 100,
      sourceSize: null,
      modelBytes: null,
      ...emptyInspect,
    });
  },
}));
