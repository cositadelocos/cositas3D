import { VIEW_FACES, type ViewFace } from "@/lib/camera";
import { cn } from "@/lib/utils";
import { useViewer } from "@/lib/viewer-store";

const FACE_STYLE: Record<ViewFace, string> = {
  front: "col-start-2 row-start-2",
  back: "col-start-2 row-start-4",
  left: "col-start-1 row-start-2",
  right: "col-start-3 row-start-2",
  top: "col-start-2 row-start-1",
  bottom: "col-start-2 row-start-3",
};

export function ViewCube() {
  const viewFace = useViewer((s) => s.viewFace);
  const snapView = useViewer((s) => s.snapView);

  return (
    <div className="absolute right-4 bottom-4 z-10 hidden sm:block">
      <div className="rounded-lg bg-card/90 p-2 shadow-border backdrop-blur-sm">
        <p className="mb-1.5 text-center text-[10px] tracking-[0.16em] text-subtle uppercase">Caras</p>
        <div className="grid grid-cols-3 grid-rows-4 gap-1">
          {VIEW_FACES.map((face) => {
            const selected = viewFace === face.id;
            return (
              <button
                key={face.id}
                type="button"
                onClick={() => snapView(face.id)}
                title={face.label}
                className={cn(
                  "h-8 min-w-8 rounded-sm px-1 text-[10px] font-medium transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
                  FACE_STYLE[face.id],
                  selected
                    ? "bg-foreground text-background"
                    : "bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {face.id === "front"
                  ? "Frente"
                  : face.id === "back"
                    ? "Atrás"
                    : face.id === "left"
                      ? "Izq"
                      : face.id === "right"
                        ? "Der"
                        : face.id === "top"
                          ? "Sup"
                          : "Inf"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
