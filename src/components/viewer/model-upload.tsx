import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_OBJECT_NAME } from "@/lib/brand";
import { ACCEPT_ATTR, formatLabel } from "@/lib/model-files";
import { cn } from "@/lib/utils";
import { useViewer } from "@/lib/viewer-store";

function fmt(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (value >= 100) return value.toFixed(1);
  if (value >= 10) return value.toFixed(2);
  return value.toFixed(3);
}

export function ModelUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const loadModelFromFiles = useViewer((s) => s.loadModelFromFiles);
  const restoreDemo = useViewer((s) => s.restoreDemo);
  const modelKind = useViewer((s) => s.modelKind);
  const modelName = useViewer((s) => s.modelName);
  const modelFormat = useViewer((s) => s.modelFormat);
  const modelStatus = useViewer((s) => s.modelStatus);
  const modelError = useViewer((s) => s.modelError);
  const sourceSize = useViewer((s) => s.sourceSize);

  const onFiles = (list: FileList | File[] | null) => {
    if (!list || (Array.isArray(list) ? list.length === 0 : list.length === 0)) return;
    loadModelFromFiles(Array.from(list));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium">Modelo 3D</h2>
        {modelKind === "file" && modelFormat ? (
          <p className="text-xs text-muted-foreground">{formatLabel(modelFormat)}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{DEMO_OBJECT_NAME}</p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPT_ATTR}
        multiple
        onChange={(event) => {
          onFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-5 text-center transition-[box-shadow,background-color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
          "border-border bg-background hover:shadow-border-hover",
        )}
      >
        <Upload className="size-4 text-subtle" aria-hidden="true" />
        <span className="text-sm font-medium">
          {modelStatus === "loading" ? "Cargando…" : "Cargar modelo"}
        </span>
        <span className="text-xs text-subtle text-pretty">
          GLB, FBX, glTF, OBJ, STL o 3DS. Máximo 50 MB.
        </span>
      </button>

      <p className="text-xs text-subtle text-pretty">
        Si el archivo pesa más de 50 MB, no entra. Fusion y 3ds Max: exporta GLB o FBX, no el archivo nativo. En
        pantalla se encuadra solo; la exportación sale en milímetros, sin ese encuadre.
      </p>
      {sourceSize ? (
        <p className="text-xs text-muted-foreground">
          Medidas: {fmt(sourceSize.x)} × {fmt(sourceSize.y)} × {fmt(sourceSize.z)} mm
        </p>
      ) : null}

      {modelKind === "file" ? (
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-xs text-muted-foreground" title={modelName}>
            {modelName}
          </p>
          <Button type="button" variant="ghost" size="sm" onClick={restoreDemo}>
            Volver a {DEMO_OBJECT_NAME}
          </Button>
        </div>
      ) : null}

      {modelError ? (
        <p
          className={cn(
            "text-xs text-pretty",
            modelError.includes("50 MB")
              ? "rounded-md bg-background px-3 py-2 text-foreground shadow-border"
              : "text-muted-foreground",
          )}
        >
          {modelError}
        </p>
      ) : null}
    </div>
  );
}
