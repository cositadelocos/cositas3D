import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useViewer } from "@/lib/viewer-store";

function fileSafe(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "") || "captura";
}

export function CaptureBridge() {
  const captureToken = useViewer((s) => s.captureToken);
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if (!captureToken) return;
    gl.render(scene, camera);
    const url = gl.domElement.toDataURL("image/png");
    const name = fileSafe(useViewer.getState().modelName);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.png`;
    link.click();
    useViewer.getState().markCaptured();
  }, [captureToken, gl, scene, camera]);

  return null;
}
