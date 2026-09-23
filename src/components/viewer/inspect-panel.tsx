import { Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { downloadDataUrl, downloadJson } from "@/lib/inspect";
import { cn } from "@/lib/utils";
import { useViewer, type ExplodeAxis } from "@/lib/viewer-store";

const AXES: ExplodeAxis[] = ["x", "y", "z"];

export function InspectPanel() {
  const parts = useViewer((s) => s.parts);
  const hiddenPartIds = useViewer((s) => s.hiddenPartIds);
  const togglePart = useViewer((s) => s.togglePart);
  const setAllPartsVisible = useViewer((s) => s.setAllPartsVisible);
  const textures = useViewer((s) => s.textures);
  const materials = useViewer((s) => s.materials);
  const modelName = useViewer((s) => s.modelName);
  const explode = useViewer((s) => s.explode);
  const setExplode = useViewer((s) => s.setExplode);
  const explodeAxes = useViewer((s) => s.explodeAxes);
  const toggleExplodeAxis = useViewer((s) => s.toggleExplodeAxis);
  const visibleCount = parts.filter((part) => !hiddenPartIds.includes(part.id)).length;

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-medium">Despiece</h2>
          <p className="text-xs text-muted-foreground">{Math.round(explode)}%</p>
        </div>
        <p className="mb-2 text-xs text-subtle text-pretty">
          Separa las partes desde el centro. Elige en qué ejes se pueden mover.
        </p>
        <div className="mb-3 grid grid-cols-3 gap-1 rounded-lg bg-background p-1">
          {AXES.map((axis) => (
            <button
              key={axis}
              type="button"
              onClick={() => toggleExplodeAxis(axis)}
              className={cn(
                "h-9 rounded-md text-xs font-medium uppercase transition-[background-color,color] duration-[var(--motion-quick)]",
                explodeAxes[axis]
                  ? "bg-card text-foreground shadow-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Eje {axis}
            </button>
          ))}
        </div>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[explode]}
          onValueChange={(v) => setExplode(v[0] ?? 0)}
          aria-label="Separación del despiece"
        />
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-medium">Partes</h2>
          <p className="text-xs text-muted-foreground">
            {visibleCount}/{parts.length}
          </p>
        </div>
        {parts.length === 0 ? (
          <p className="text-xs text-subtle">Cargando piezas…</p>
        ) : (
          <>
            <div className="mb-2 flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setAllPartsVisible(true)}>
                Todas
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setAllPartsVisible(false)}>
                Ninguna
              </Button>
            </div>
            <ul className="max-h-44 space-y-1 overflow-y-auto pr-1">
              {parts.map((part) => {
                const hidden = hiddenPartIds.includes(part.id);
                return (
                  <li key={part.id}>
                    <button
                      type="button"
                      onClick={() => togglePart(part.id)}
                      className={cn(
                        "flex h-9 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-xs transition-colors duration-[var(--motion-quick)]",
                        hidden ? "text-subtle" : "bg-background text-foreground",
                      )}
                    >
                      <span className="truncate">
                        {part.name}
                        {part.count > 1 ? ` · ${part.count}` : ""}
                      </span>
                      {hidden ? (
                        <EyeOff className="size-3.5 shrink-0" aria-hidden="true" />
                      ) : (
                        <Eye className="size-3.5 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-medium">Texturas UV</h2>
          <p className="text-xs text-muted-foreground">{textures.length || "—"}</p>
        </div>
        {textures.length === 0 ? (
          <p className="text-xs text-subtle text-pretty">Este modelo no trae mapas de imagen. Un GLB con UVs las muestra aquí.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {textures.map((tex) => (
              <li key={tex.id} className="overflow-hidden rounded-md bg-background shadow-border">
                <img src={tex.dataUrl} alt={tex.name} className="aspect-square w-full object-cover" />
                <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                  <p className="truncate text-[10px] text-muted-foreground">
                    {tex.slot}
                    <span className="text-subtle">
                      {" "}
                      {tex.width}×{tex.height}
                    </span>
                  </p>
                  <button
                    type="button"
                    aria-label={`Descargar ${tex.slot}`}
                    onClick={() =>
                      downloadDataUrl(tex.dataUrl, `${modelName}-${tex.slot.replace(/\s+/g, "-").toLowerCase()}.png`)
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Download className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-medium">Materiales</h2>
          <p className="text-xs text-muted-foreground">{materials.length || "—"}</p>
        </div>
        {materials.length === 0 ? (
          <p className="text-xs text-subtle">Sin materiales extraíbles.</p>
        ) : (
          <ul className="space-y-2">
            {materials.map((mat, index) => (
              <li key={mat.id} className="rounded-md bg-background px-3 py-2 shadow-border">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-4 shrink-0 rounded-full shadow-border"
                      style={{ backgroundColor: mat.color }}
                      aria-hidden="true"
                    />
                    <p className="truncate text-xs font-medium">{mat.name === "Material" ? `Material ${index + 1}` : mat.name}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Descargar ${mat.name}`}
                    onClick={() =>
                      downloadJson(
                        {
                          name: mat.name,
                          type: mat.type,
                          color: mat.color,
                          metalness: mat.metalness,
                          roughness: mat.roughness,
                          maps: mat.maps,
                        },
                        `${modelName}-${(mat.name || "material").replace(/\s+/g, "-").toLowerCase()}.json`,
                      )
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Download className="size-3.5" aria-hidden="true" />
                  </button>
                </div>
                <p className="mt-1 text-[10px] text-subtle">
                  {mat.type}
                  {mat.metalness != null ? ` · metal ${Math.round(mat.metalness * 100)}%` : ""}
                  {mat.roughness != null ? ` · rug ${Math.round(mat.roughness * 100)}%` : ""}
                  {mat.maps.length ? ` · ${mat.maps.length} mapas` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
