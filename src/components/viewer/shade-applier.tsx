import { useFrame } from "@react-three/fiber";
import { useEffect, type RefObject } from "react";
import type * as THREE from "three";
import { applyShade } from "@/lib/shade";
import { useViewer } from "@/lib/viewer-store";

export function ShadeApplier({ rootRef }: { rootRef: RefObject<THREE.Group | null> }) {
  const shadeMode = useViewer((s) => s.shadeMode);
  const meshColor = useViewer((s) => s.meshColor);
  const modelStatus = useViewer((s) => s.modelStatus);
  const modelUrl = useViewer((s) => s.modelUrl);
  const finishId = useViewer((s) => s.finishId);

  useEffect(() => {
    const root = rootRef.current;
    if (root) applyShade(root, shadeMode, meshColor);
  }, [shadeMode, meshColor, modelStatus, modelUrl, finishId, rootRef]);

  useFrame(() => {
    if (shadeMode === "material") return;
    const root = rootRef.current;
    if (root) applyShade(root, shadeMode, meshColor);
  });

  return null;
}
