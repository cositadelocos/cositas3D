import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import type { CaptureSize } from "@/lib/viewer-store";
import { useViewer } from "@/lib/viewer-store";

function isIos() {
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function saveOnDesktop(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function fileSafe(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "") || "captura"
  );
}

function outputSize(size: CaptureSize, width: number, height: number, maxTexture: number) {
  const aspect = width / Math.max(1, height);
  const longEdge = size === "4k" ? 3840 : size === "2k" ? 2560 : Math.max(width, height, 1600);
  const capped = Math.min(longEdge, maxTexture);
  let w = aspect >= 1 ? capped : Math.round(capped * aspect);
  let h = aspect >= 1 ? Math.round(capped / aspect) : capped;
  w = Math.max(2, w - (w % 2));
  h = Math.max(2, h - (h % 2));
  return { w, h };
}

function hideStudio(scene: THREE.Scene) {
  const hidden: THREE.Object3D[] = [];
  scene.traverse((child) => {
    if (child.userData.studio && child.visible) {
      child.visible = false;
      hidden.push(child);
    }
  });
  return hidden;
}

export function CaptureBridge() {
  const captureToken = useViewer((s) => s.captureToken);
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if (!captureToken) return;

    const { captureFormat, captureSize, modelName, shadeMode } = useViewer.getState();
    const isolate = captureFormat === "png";
    const view = gl.domElement;
    const maxTexture = isIos()
      ? Math.min(gl.capabilities.maxTextureSize, 2048)
      : gl.capabilities.maxTextureSize;
    const { w, h } = outputSize(
      captureSize,
      view.clientWidth || 1280,
      view.clientHeight || 720,
      maxTexture,
    );

    const prevTarget = gl.getRenderTarget();
    const prevBackground = scene.background;
    const clear = new THREE.Color();
    gl.getClearColor(clear);
    const prevAlpha = gl.getClearAlpha();
    const hidden = isolate ? hideStudio(scene) : [];

    const target = new THREE.WebGLRenderTarget(w, h, {
      format: THREE.RGBAFormat,
      type: THREE.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false,
    });

    if (isolate) {
      scene.background = null;
      gl.setClearColor(0x000000, 0);
    }

    gl.setRenderTarget(target);
    gl.clear(true, true, true);
    gl.render(scene, camera);

    const buffer = new Uint8Array(w * h * 4);
    gl.readRenderTargetPixels(target, 0, 0, w, h, buffer);

    gl.setRenderTarget(prevTarget);
    scene.background = prevBackground;
    gl.setClearColor(clear, prevAlpha);
    for (const object of hidden) object.visible = true;
    target.dispose();

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const image = ctx.createImageData(w, h);
    const row = w * 4;
    for (let y = 0; y < h; y += 1) {
      const src = (h - 1 - y) * row;
      image.data.set(buffer.subarray(src, src + row), y * row);
    }
    ctx.putImageData(image, 0, 0);

    const mime = captureFormat === "jpeg" ? "image/jpeg" : "image/png";
    const filename = `${fileSafe(modelName)}-${shadeMode}-${captureSize}.${captureFormat === "jpeg" ? "jpg" : "png"}`;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        if (isIos()) {
          useViewer.getState().setCapturePreview({
            url: URL.createObjectURL(blob),
            filename,
            mime,
          });
          return;
        }
        saveOnDesktop(blob, filename);
        useViewer.getState().markCaptured();
      },
      mime,
      0.95,
    );
  }, [captureToken, gl, scene, camera]);

  return null;
}
