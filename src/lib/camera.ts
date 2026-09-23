export const CAMERA = {
  position: [2.42, 1.08, 3.28] as const,
  target: [0, 0.34, 0] as const,
  fov: 32,
  minDistance: 1.8,
  maxDistance: 7.2,
  minPolar: 0.08,
  maxPolar: Math.PI - 0.08,
};

export type ViewFace = "front" | "back" | "left" | "right" | "top" | "bottom";

export const VIEW_FACES: { id: ViewFace; label: string }[] = [
  { id: "top", label: "Arriba" },
  { id: "front", label: "Frente" },
  { id: "right", label: "Derecha" },
  { id: "left", label: "Izquierda" },
  { id: "back", label: "Atrás" },
  { id: "bottom", label: "Abajo" },
];

export const VIEW_DIRS: Record<ViewFace, readonly [number, number, number]> = {
  front: [0, 0.18, 1],
  back: [0, 0.18, -1],
  right: [1, 0.18, 0],
  left: [-1, 0.18, 0],
  top: [0, 1, 0.04],
  bottom: [0, -1, 0.04],
};

export function viewSpan(frame = 100) {
  const k = Math.min(180, Math.max(40, frame)) / 100;
  return {
    min: CAMERA.minDistance * k,
    max: CAMERA.maxDistance * k,
  };
}

export function zoomToDistance(zoom: number, frame = 100) {
  const { min, max } = viewSpan(frame);
  const t = Math.min(100, Math.max(0, zoom)) / 100;
  return max - t * (max - min);
}

export function distanceToZoom(distance: number, frame = 100) {
  const { min, max } = viewSpan(frame);
  const span = max - min;
  return Math.min(100, Math.max(0, ((max - distance) / span) * 100));
}
