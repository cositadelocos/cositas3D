import { useEffect, type RefObject } from "react";
import type * as THREE from "three";
import { applyPartVisibility, inspectModel } from "@/lib/inspect";
import { useViewer } from "@/lib/viewer-store";

export function InspectSync({ rootRef }: { rootRef: RefObject<THREE.Group | null> }) {
  const modelStatus = useViewer((s) => s.modelStatus);
  const modelUrl = useViewer((s) => s.modelUrl);
  const modelKind = useViewer((s) => s.modelKind);
  const hiddenPartIds = useViewer((s) => s.hiddenPartIds);
  const setInspect = useViewer((s) => s.setInspect);

  useEffect(() => {
    let frames = 0;
    let raf = 0;
    const tick = () => {
      const root = rootRef.current;
      if (root && root.children.length > 0) {
        setInspect(inspectModel(root));
        return;
      }
      if (frames++ < 40) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [modelStatus, modelUrl, modelKind, rootRef, setInspect]);

  useEffect(() => {
    const root = rootRef.current;
    if (root) applyPartVisibility(root, hiddenPartIds);
  }, [hiddenPartIds, modelStatus, rootRef]);

  return null;
}
