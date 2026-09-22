import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMO_OBJECT_NAME } from "@/lib/brand";
import { ACCEPT_ATTR, formatLabel } from "@/lib/model-files";
import { cn } from "@/lib/utils";
import { useViewer } from "@/lib/viewer-store";

export function ModelUpload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const loadModelFromFiles = useViewer((s) => s.loadModelFromFiles);
  const restoreDemo = useViewer((s) => s.restoreDemo);
  const modelKind = useViewer((s) => s.modelKind);
  const modelName = useViewer((s) => s.modelName);
  const modelFormat = useViewer((s) => s.modelFormat);
  const modelStatus = useViewer((s) => s.modelStatus);
  const modelError = useViewer((s) => s.modelError);

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
          Arrastra un archivo o pulsa para elegir. Recomendado:{" "}
          <span className="text-muted-foreground">GLB</span>
        </span>
      </button>

      <p className="text-xs text-subtle text-pretty">
        Formatos: GLB, glTF, OBJ y STL. El GLB lleva malla y texturas en un solo archivo. Desde Blender:
        File → Export → glTF 2.0 (.glb).
      </p>

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

      {modelError ? <p className="text-xs text-pretty text-muted-foreground">{modelError}</p> : null}
    </div>
  );
}
