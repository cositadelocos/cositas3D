import * as THREE from "three";

function fillNoise(ctx: CanvasRenderingContext2D, size: number, contrast: number) {
  const img = ctx.getImageData(0, 0, size, size);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % size;
    const y = Math.floor(i / 4 / size);
    const n =
      128 +
      Math.sin(x * 0.37 + y * 0.19) * 18 +
      ((Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1) * contrast;
    data[i] = n;
    data[i + 1] = n;
    data[i + 2] = n;
    data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

function makeCanvasTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D context");
  draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

let cache: { grain: THREE.CanvasTexture; brushed: THREE.CanvasTexture } | null = null;

export function getStudioTextures() {
  if (cache) return cache;

  const grain = makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);
    fillNoise(ctx, size, 36);
  });
  grain.repeat.set(3, 3);
  grain.colorSpace = THREE.NoColorSpace;

  const brushed = makeCanvasTexture((ctx, size) => {
    ctx.fillStyle = "#7a7a7a";
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y++) {
      const shade = 90 + ((Math.sin(y * 0.85) * 43758.5453) % 1) * 70;
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.fillRect(0, y, size, 1);
    }
  }, 256);
  brushed.repeat.set(1, 8);
  brushed.colorSpace = THREE.NoColorSpace;

  cache = { grain, brushed };
  return cache;
}
