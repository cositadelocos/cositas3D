import type { ReactNode } from "react";
import { Box, Camera, Grid3x3, RotateCcw, Sparkles, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { InspectPanel } from "./inspect-panel";
import { ModelUpload } from "./model-upload";
import { APP_SUBTITLE, DEMO_OBJECT_NAME } from "@/lib/brand";
import { SCENES } from "@/lib/scenes";
import { FINISHES, ORIGINAL_FINISH, getFinish } from "@/lib/finishes";
import { formatLabel } from "@/lib/model-files";
import { SHADE_MODES, type ShadeMode } from "@/lib/shade";
import { cn } from "@/lib/utils";
import { ANIM_MODES, CAPTURE_SIZES, EXPORT_FORMATS, LIGHT_PRESETS, useViewer, type LightPresetId } from "@/lib/viewer-store";

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-xs font-medium tracking-wide text-muted-foreground">{label}</label>
        <span className="font-mono text-xs tabular-nums text-subtle">{value}</span>
      </div>
      {children}
    </div>
  );
}

const SHADE_ICONS: Record<ShadeMode, typeof Box> = {
  mesh: Grid3x3,
  solid: Box,
  material: Sparkles,
};

const MESH_SWATCHES = ["#dce1e8", "#7dd3fc", "#fbbf24", "#f472b6", "#4ade80", "#f87171", "#ffffff", "#111111"];

export function ControlPanel() {
  const finishId = useViewer((s) => s.finishId);
  const setFinish = useViewer((s) => s.setFinish);
  const zoom = useViewer((s) => s.zoom);
  const setZoom = useViewer((s) => s.setZoom);
  const frame = useViewer((s) => s.frame);
  const setFrame = useViewer((s) => s.setFrame);
  const intensity = useViewer((s) => s.intensity);
  const setIntensity = useViewer((s) => s.setIntensity);
  const warmth = useViewer((s) => s.warmth);
  const setWarmth = useViewer((s) => s.setWarmth);
  const env = useViewer((s) => s.env);
  const setEnv = useViewer((s) => s.setEnv);
  const preset = useViewer((s) => s.preset);
  const setPreset = useViewer((s) => s.setPreset);
  const sceneId = useViewer((s) => s.sceneId);
  const sceneColor = useViewer((s) => s.sceneColor);
  const setScene = useViewer((s) => s.setScene);
  const setSceneColor = useViewer((s) => s.setSceneColor);
  const shadeMode = useViewer((s) => s.shadeMode);
  const setShadeMode = useViewer((s) => s.setShadeMode);
  const meshColor = useViewer((s) => s.meshColor);
  const setMeshColor = useViewer((s) => s.setMeshColor);
  const animMode = useViewer((s) => s.animMode);
  const setAnimMode = useViewer((s) => s.setAnimMode);
  const resetCamera = useViewer((s) => s.resetCamera);
  const requestCapture = useViewer((s) => s.requestCapture);
  const captureFormat = useViewer((s) => s.captureFormat);
  const setCaptureFormat = useViewer((s) => s.setCaptureFormat);
  const captureSize = useViewer((s) => s.captureSize);
  const setCaptureSize = useViewer((s) => s.setCaptureSize);
  const requestExport = useViewer((s) => s.requestExport);
  const exportNote = useViewer((s) => s.exportNote);
  const modelKind = useViewer((s) => s.modelKind);
  const modelName = useViewer((s) => s.modelName);
  const modelFormat = useViewer((s) => s.modelFormat);
  const finish = getFinish(finishId);
  const isFile = modelKind === "file";
  const swatches = [ORIGINAL_FINISH, ...FINISHES];

  return (
    <aside className="flex flex-col gap-5 rounded-xl bg-card p-4 shadow-border lg:p-5">
      <div>
        <p className="text-xs font-medium tracking-[0.18em] text-subtle uppercase">
          {isFile ? "Modelo cargado" : APP_SUBTITLE}
        </p>
        <h1 className="font-display mt-1 text-3xl leading-tight font-medium text-balance text-foreground">
          {isFile ? modelName : DEMO_OBJECT_NAME}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          {isFile
            ? `${modelFormat ? formatLabel(modelFormat) : "3D"} · centrado y escalado en el estudio`
            : "Pieza de prueba para orbitar, iluminar y teñir. Carga la tuya cuando quieras."}
        </p>
      </div>

      <Separator />
      <ModelUpload />
      <Separator />

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium">Vista</h2>
          <p className="text-xs text-muted-foreground">
            {SHADE_MODES.find((item) => item.id === shadeMode)?.label}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-background p-1">
          {SHADE_MODES.map((item) => {
            const Icon = SHADE_ICONS[item.id];
            const selected = item.id === shadeMode;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setShadeMode(item.id)}
                className={cn(
                  "flex h-11 items-center justify-center gap-1.5 rounded-md px-2 text-xs font-medium transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                  selected
                    ? "bg-card text-foreground shadow-border"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
        {shadeMode === "mesh" ? (
          <div className="mt-3">
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">Color de malla</p>
            <div className="flex flex-wrap items-center gap-2">
              {MESH_SWATCHES.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Malla ${color}`}
                  onClick={() => setMeshColor(color)}
                  className={cn(
                    "size-8 rounded-full",
                    meshColor === color
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-card"
                      : "shadow-border",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              <label className="relative size-8 overflow-hidden rounded-full shadow-border">
                <span className="sr-only">Color libre</span>
                <input
                  type="color"
                  value={meshColor}
                  onChange={(event) => setMeshColor(event.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <span className="block size-full" style={{ backgroundColor: meshColor }} />
              </label>
            </div>
          </div>
        ) : null}
      </div>

      <Separator />

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium">Animación</h2>
          <p className="text-xs text-muted-foreground">
            {ANIM_MODES.find((item) => item.id === animMode)?.label}
          </p>
        </div>
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-background p-1">
          {ANIM_MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAnimMode(item.id)}
              className={cn(
                "h-9 rounded-md px-1 text-xs font-medium transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                animMode === item.id
                  ? "bg-card text-foreground shadow-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium">{isFile ? "Tinte" : "Acabado"}</h2>
          <p className="text-xs text-muted-foreground">{finish.name}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {swatches.map((item) => {
            const selected = item.id === finishId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFinish(item.id)}
                aria-label={item.name}
                aria-pressed={selected}
                title={`${item.name} · ${item.caption}`}
                className={cn(
                  "relative size-11 rounded-full transition-[transform,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] active:scale-[0.96]",
                  selected
                    ? "shadow-border-hover ring-2 ring-foreground ring-offset-2 ring-offset-card"
                    : "shadow-border hover:shadow-border-hover",
                )}
                style={{ backgroundColor: item.swatch }}
              />
            );
          })}
        </div>
        <p className="mt-2 text-xs text-subtle">{finish.caption}</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-sm font-medium">Iluminación</h2>
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-background p-1">
          {(Object.keys(LIGHT_PRESETS) as LightPresetId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPreset(id)}
              className={cn(
                "h-9 rounded-md px-1 text-xs font-medium transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                preset === id
                  ? "bg-card text-foreground shadow-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {LIGHT_PRESETS[id].label}
            </button>
          ))}
        </div>
        <Field label="Intensidad" value={`${Math.round(intensity * 100)}%`}>
          <Slider
            min={0.2}
            max={1}
            step={0.01}
            value={[intensity]}
            onValueChange={(v) => setIntensity(v[0] ?? intensity)}
            aria-label="Intensidad de luz"
          />
        </Field>
        <Field label="Temperatura" value={warmth > 0.5 ? "Cálida" : warmth < 0.3 ? "Fría" : "Neutra"}>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[warmth]}
            onValueChange={(v) => setWarmth(v[0] ?? warmth)}
            aria-label="Temperatura de color"
          />
        </Field>
        <Field label="Ambiente" value={`${Math.round(env * 100)}%`}>
          <Slider
            min={0.05}
            max={1.2}
            step={0.01}
            value={[env]}
            onValueChange={(v) => setEnv(v[0] ?? env)}
            aria-label="Luz de entorno"
          />
        </Field>
      </div>

      <Separator />

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-medium">Escenario</h2>
          <p className="text-xs text-muted-foreground">
            {sceneId === "custom" ? "Color" : (SCENES.find((scene) => scene.id === sceneId)?.name ?? "Noche")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {SCENES.map((scene) => {
            const selected = scene.id === sceneId;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => {
                  if (scene.id !== "custom") setScene(scene.id);
                }}
                aria-label={scene.name}
                title={scene.name}
                className={cn(
                  "size-11 rounded-full transition-[transform,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] active:scale-[0.96]",
                  selected
                    ? "shadow-border-hover ring-2 ring-foreground ring-offset-2 ring-offset-card"
                    : "shadow-border hover:shadow-border-hover",
                )}
                style={{ backgroundColor: scene.background }}
              />
            );
          })}
          <label className="relative size-11 overflow-hidden rounded-full shadow-border" title="Color libre">
            <span className="sr-only">Color del escenario</span>
            <input
              type="color"
              value={sceneColor}
              onChange={(event) => setSceneColor(event.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <span className="block size-full" style={{ backgroundColor: sceneColor }} />
          </label>
        </div>
        <p className="mt-2 text-xs text-subtle">Fondo, piso y pared. El último círculo es un color libre.</p>
      </div>

      <Separator />

      <div className="space-y-3">
        <Field label="Encuadre" value={`${Math.round(frame)}%`}>
          <Slider
            min={40}
            max={180}
            step={1}
            value={[frame]}
            onValueChange={(v) => setFrame(v[0] ?? frame)}
            aria-label="Encuadre en el estudio"
          />
        </Field>
        <p className="text-xs text-subtle text-pretty">
          Solo cambia cómo se ve aquí. El zoom se ajusta solo. La exportación sigue en milímetros.
        </p>
        <Field label="Zoom" value={`${Math.round(zoom)}%`}>
          <div className="flex items-center gap-3">
            <ZoomIn className="size-4 text-subtle" aria-hidden="true" />
            <Slider
              min={0}
              max={100}
              step={1}
              value={[zoom]}
              onValueChange={(v) => setZoom(v[0] ?? zoom)}
              aria-label="Zoom de cámara"
            />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={resetCamera}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Cámara
          </Button>
          <Button onClick={requestCapture}>
            <Camera className="size-4" aria-hidden="true" />
            Captura
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-background p-1">
          <button
            type="button"
            onClick={() => setCaptureFormat("png")}
            className={cn(
              "h-9 rounded-md text-xs font-medium",
              captureFormat === "png" ? "bg-card text-foreground shadow-border" : "text-muted-foreground",
            )}
          >
            PNG
          </button>
          <button
            type="button"
            onClick={() => setCaptureFormat("jpeg")}
            className={cn(
              "h-9 rounded-md text-xs font-medium",
              captureFormat === "jpeg" ? "bg-card text-foreground shadow-border" : "text-muted-foreground",
            )}
          >
            JPEG
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-background p-1">
          {CAPTURE_SIZES.map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => setCaptureSize(size.id)}
              className={cn(
                "h-9 rounded-md text-xs font-medium",
                captureSize === size.id ? "bg-card text-foreground shadow-border" : "text-muted-foreground",
              )}
            >
              {size.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-subtle text-pretty">
          {captureFormat === "png"
            ? shadeMode === "mesh"
              ? "PNG grande, fondo transparente: solo las líneas de la malla."
              : "PNG grande, fondo transparente: el objeto con su material, sin el estudio."
            : "JPEG del encuadre completo, con el estudio detrás."}
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-medium">Exportar</h2>
          <p className="mt-1 text-xs text-subtle text-pretty">
            Sale lo visible, en milímetros, con el despiece si lo tienes abierto. El encuadre del estudio no se guarda. FBX de salida no: baja un GLB.
          </p>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {EXPORT_FORMATS.map((format) => (
            <Button
              key={format.id}
              type="button"
              variant="outline"
              size="sm"
              title={format.hint}
              onClick={() => requestExport(format.id)}
            >
              {format.label}
            </Button>
          ))}
        </div>
        {exportNote ? <p className="text-xs text-muted-foreground">{exportNote}</p> : null}
      </div>

      <Separator />
      <InspectPanel />
    </aside>
  );
}
