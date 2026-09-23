import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { ControlPanel } from "./control-panel";
import { BrandMark } from "./logo";
import { ProductCanvas } from "./product-canvas";
import { ViewCube } from "./view-cube";
import { APP_NAME, APP_SUBTITLE } from "@/lib/brand";
import { useViewer } from "@/lib/viewer-store";

export function ViewerApp() {
  const resetCamera = useViewer((s) => s.resetCamera);
  const setAnimMode = useViewer((s) => s.setAnimMode);
  const loadModelFromFiles = useViewer((s) => s.loadModelFromFiles);
  const requestCapture = useViewer((s) => s.requestCapture);
  const capturedAt = useViewer((s) => s.capturedAt);
  const modelStatus = useViewer((s) => s.modelStatus);
  const [dragOver, setDragOver] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAnimMode("none");
    }
  }, [setAnimMode]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        resetCamera();
      }
      if (event.key === "c" || event.key === "C") {
        event.preventDefault();
        requestCapture();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [resetCamera, requestCapture]);

  useEffect(() => {
    if (!capturedAt) return;
    setFlash(true);
    const id = window.setTimeout(() => setFlash(false), 1400);
    return () => window.clearTimeout(id);
  }, [capturedAt]);

  return (
    <div
      className="bg-background text-foreground relative min-h-dvh lg:h-dvh lg:overflow-hidden"
      onDragEnter={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) return;
        setDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        const files = event.dataTransfer.files;
        if (files.length) loadModelFromFiles(Array.from(files));
      }}
    >
      <header className="relative z-20 flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:absolute lg:inset-x-0 lg:top-0 lg:px-8">
        <a href="/" className="flex items-center gap-2.5 text-foreground">
          <BrandMark className="size-7" />
          <span className="font-display text-lg tracking-wide">{APP_NAME}</span>
        </a>
        <p className="text-xs tracking-[0.18em] text-subtle uppercase">{APP_SUBTITLE}</p>
      </header>

      <div className="flex min-h-0 flex-col lg:h-full lg:flex-row">
        <section className="relative h-stage min-h-80 w-full lg:h-full lg:min-h-0 lg:flex-1">
          <ProductCanvas />
          <ViewCube />
          {modelStatus === "loading" ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/60">
              <p className="text-sm text-muted-foreground">Cargando modelo…</p>
            </div>
          ) : null}
          {flash ? (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-foreground/25">
              <p className="rounded-lg bg-card px-4 py-2 text-sm shadow-border">Captura guardada</p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={requestCapture}
            aria-label="Capturar modelo"
            className="absolute bottom-4 left-4 z-10 flex size-11 items-center justify-center rounded-md bg-card text-foreground shadow-border hover:shadow-border-hover"
          >
            <Camera className="size-4" aria-hidden="true" />
          </button>
          <p className="pointer-events-none absolute inset-x-0 bottom-4 hidden text-center text-xs text-subtle lg:block">
            Arrastra para orbitar · C captura · R restablece
          </p>
        </section>

        <div className="relative z-10 flex w-full flex-col gap-3 px-4 pb-8 sm:px-6 lg:h-full lg:w-96 lg:overflow-y-auto lg:px-6 lg:pt-20 lg:pb-8">
          <ControlPanel />
          <p className="text-center text-xs text-subtle lg:hidden">
            Arrastra el modelo para orbitar. Suelta un GLB o FBX para cargarlo.
          </p>
        </div>
      </div>

      {dragOver ? (
        <div className="bg-background/80 pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <div className="rounded-xl bg-card px-8 py-6 text-center shadow-border">
            <p className="font-display text-xl">Suelta el modelo</p>
            <p className="mt-1 text-sm text-muted-foreground">GLB, FBX, OBJ, STL o 3DS</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
