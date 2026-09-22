import { useFrame } from "@react-three/fiber";
import { useEffect, type RefObject } from "react";
import type * as THREE from "three";
import { useViewer } from "@/lib/viewer-store";

export function ModelAnimator({ rootRef }: { rootRef: RefObject<THREE.Group | null> }) {
  const animMode = useViewer((s) => s.animMode);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (animMode === "none") {
      root.rotation.set(0, 0, 0);
      if (root.userData.baseY != null) root.position.y = root.userData.baseY as number;
    }
  }, [animMode, rootRef]);

  useFrame(({ clock }) => {
    const root = rootRef.current;
    if (!root) return;
    if (root.userData.baseY == null) root.userData.baseY = root.position.y;
    const baseY = root.userData.baseY as number;
    const t = clock.elapsedTime;

    if (animMode === "turntable") {
      root.rotation.x = 0;
      root.rotation.z = 0;
      root.rotation.y = t * 0.7;
      root.position.y = baseY;
    } else if (animMode === "oscillate") {
      root.rotation.y = Math.sin(t * 2.6) * 0.42;
      root.rotation.x = Math.sin(t * 1.8) * 0.1;
      root.rotation.z = Math.sin(t * 1.4) * 0.05;
      root.position.y = baseY;
    } else if (animMode === "hopspin") {
      root.rotation.x = 0;
      root.rotation.z = 0;
      root.rotation.y = t * 3.1;
      root.position.y = baseY + Math.abs(Math.sin(t * 5.2)) * 0.32;
    }
  });

  return null;
}
