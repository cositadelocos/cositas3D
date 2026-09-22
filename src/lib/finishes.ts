export type Finish = {
  id: string;
  name: string;
  caption: string;
  swatch: string;
  metal: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
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
    cushion: "#0e1013",
    inner: "#090a0c",
    hardware: "#6e747c",
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
  cushion: "#ece7e0",
  inner: "#b8bcc4",
  hardware: "#9aa1ab",
};

export function getFinish(id: string): Finish {
  if (id === ORIGINAL_FINISH.id) return ORIGINAL_FINISH;
  return FINISHES.find((item) => item.id === id) ?? FINISHES[0]!;
}

