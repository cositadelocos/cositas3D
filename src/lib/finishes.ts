export type Finish = {
  id: string;
  name: string;
  caption: string;
  swatch: string;
  metal: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  envMapIntensity: number;
  emissive: string;
  emissiveIntensity: number;
  cushion: string;
  inner: string;
  hardware: string;
};

export const FINISHES: Finish[] = [
  {
    id: "graphite",
    name: "Grafito",
    caption: "Aluminio anodizado mate",
    swatch: "#3a3d42",
    metal: "#4a4f57",
    metalness: 0.72,
    roughness: 0.38,
    clearcoat: 0.35,
    clearcoatRoughness: 0.4,
    envMapIntensity: 1,
    emissive: "#000000",
    emissiveIntensity: 0,
    cushion: "#1a1c1f",
    inner: "#111214",
    hardware: "#8b9098",
  },
  {
    id: "polar",
    name: "Polar",
    caption: "Aluminio cepillado",
    swatch: "#d5d8de",
    metal: "#c5cad2",
    metalness: 0.95,
    roughness: 0.22,
    clearcoat: 0.7,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.15,
    emissive: "#000000",
    emissiveIntensity: 0,
    cushion: "#ece7e0",
    inner: "#b8bcc4",
    hardware: "#9aa1ab",
  },
  {
    id: "ivory",
    name: "Marfil",
    caption: "Cerámica suave",
    swatch: "#e8e0d2",
    metal: "#e4d9c8",
    metalness: 0.45,
    roughness: 0.42,
    clearcoat: 0.55,
    clearcoatRoughness: 0.35,
    envMapIntensity: 0.85,
    emissive: "#000000",
    emissiveIntensity: 0,
    cushion: "#cbbba6",
    inner: "#a89884",
    hardware: "#b7a790",
  },
  {
    id: "slate",
    name: "Pizarra",
    caption: "Laca azul-gris",
    swatch: "#4d5968",
    metal: "#3e4a58",
    metalness: 0.55,
    roughness: 0.38,
    clearcoat: 0.8,
    clearcoatRoughness: 0.22,
    envMapIntensity: 1.05,
    emissive: "#000000",
    emissiveIntensity: 0,
    cushion: "#1e242c",
    inner: "#14181e",
    hardware: "#8a97a6",
  },
  {
    id: "ink",
    name: "Tinta",
    caption: "DLC profundo",
    swatch: "#1b1e24",
    metal: "#16181c",
    metalness: 0.7,
    roughness: 0.28,
    clearcoat: 0.9,
    clearcoatRoughness: 0.18,
    envMapIntensity: 1.1,
    emissive: "#000000",
    emissiveIntensity: 0,
    cushion: "#0e1013",
    inner: "#090a0c",
    hardware: "#6e747c",
  },
  {
    id: "chrome",
    name: "Metal",
    caption: "Cromo pulido, refleja el estudio",
    swatch: "#c5ced8",
    metal: "#e4ebf2",
    metalness: 1,
    roughness: 0.08,
    clearcoat: 0.35,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.85,
    emissive: "#000000",
    emissiveIntensity: 0,
    cushion: "#9aa3ad",
    inner: "#6d7680",
    hardware: "#f2f5f8",
  },
  {
    id: "mirror",
    name: "Espejo",
    caption: "Reflexión casi perfecta",
    swatch: "#f4f7fb",
    metal: "#f7fbff",
    metalness: 1,
    roughness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 2.6,
    emissive: "#000000",
    emissiveIntensity: 0,
    cushion: "#d5dde6",
    inner: "#aeb8c4",
    hardware: "#ffffff",
  },
  {
    id: "coldlight",
    name: "Luz fría",
    caption: "Emisión verde fría, brillante",
    swatch: "#5dffc6",
    metal: "#10241e",
    metalness: 0.2,
    roughness: 0.32,
    clearcoat: 0.45,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.35,
    emissive: "#8affe0",
    emissiveIntensity: 2.4,
    cushion: "#0c1a16",
    inner: "#07110e",
    hardware: "#b8fff0",
  },
];

export const ORIGINAL_FINISH: Finish = {
  id: "original",
  name: "Original",
  caption: "Materiales del archivo",
  swatch: "#d4d4d8",
  metal: "#c5cad2",
  metalness: 0.7,
  roughness: 0.35,
  clearcoat: 0.2,
  clearcoatRoughness: 0.3,
  envMapIntensity: 1,
  emissive: "#000000",
  emissiveIntensity: 0,
  cushion: "#ece7e0",
  inner: "#b8bcc4",
  hardware: "#9aa1ab",
};

export function getFinish(id: string): Finish {
  if (id === ORIGINAL_FINISH.id) return ORIGINAL_FINISH;
  return FINISHES.find((item) => item.id === id) ?? FINISHES[0]!;
}
