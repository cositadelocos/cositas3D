import { create } from "zustand";
import { DEMO_OBJECT_NAME } from "@/lib/brand";
import type { ViewFace } from "@/lib/camera";
import type { MaterialAsset, ModelPart, TextureAsset } from "@/lib/inspect";
import { classifyModelFiles, type ModelFormat } from "@/lib/model-files";
import { SCENES, type SceneId } from "@/lib/scenes";
import type { ShadeMode } from "@/lib/shade";

export const LIGHT_PRESETS = {
  estudio: { label: "Estudio", intensity: 0.86, warmth: 0.26, env: 0.7 },
  galeria: { label: "Galería", intensity: 0.72, warmth: 0.64, env: 0.46 },
  foco: { label: "Foco", intensity: 1, warmth: 0.38, env: 0.2 },
  alba: { label: "Alba", intensity: 0.58, warmth: 0.14, env: 0.92 },
} as const;

export type LightPresetId = keyof typeof LIGHT_PRESETS;
export type ModelKind = "demo" | "file";
export type ModelStatus = "idle" | "loading" | "ready" | "error";
export type AnimMode = "none" | "turntable" | "oscillate" | "hopspin";
export type ExportFormat = "glb" | "gltf" | "stl" | "obj";
export type CaptureFormat = "png" | "jpeg";
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
  preset: LightPresetId | "custom";
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
  captureSize: CaptureSize;
  explode: number;
  explodeAxes: Record<ExplodeAxis, boolean>;
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
  setCaptureFormat: (format: CaptureFormat) => void;
  setCaptureSize: (size: CaptureSize) => void;
  setExplode: (value: number) => void;
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
  finishId: "polar",
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
  captureSize: "2k",
  explode: 0,
  explodeAxes: { x: true, y: true, z: true },
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
  sourceSize: null,
  frame: 100,
  parts: [],
  hiddenPartIds: [],
  textures: [],
  materials: [],
  setFinish: (finishId) => set({ finishId }),
  setZoom: (zoom) => set({ zoom }),
  setIntensity: (intensity) => set({ intensity, preset: "custom" }),
  setWarmth: (warmth) => set({ warmth, preset: "custom" }),
  setEnv: (env) => set({ env, preset: "custom" }),
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
  setCaptureFormat: (captureFormat) => set({ captureFormat }),
  setCaptureSize: (captureSize) => set({ captureSize }),
  setExplode: (explode) => set({ explode }),
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
      set({ modelStatus: "error", modelError: classified.error });
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
      finishId: "original",
      shadeMode: "material",
      hiddenPartIds: [],
      explode: 0,
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
      finishId: "polar",
      shadeMode: "material",
      resetToken: prev.resetToken + 1,
      zoom: DEFAULT_ZOOM,
      viewFace: "orbit",
      hiddenPartIds: [],
      explode: 0,
      frame: 100,
      sourceSize: null,
      ...emptyInspect,
    });
  },
}));
