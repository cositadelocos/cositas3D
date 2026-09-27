export type SceneId =
  | "noche"
  | "galeria"
  | "concreto"
  | "arena"
  | "oceano"
  | "bosque"
  | "atardecer"
  | "hielo"
  | "vino"
  | "cobalto"
  | "magenta"
  | "oro"
  | "blanco"
  | "rosa"
  | "lima"
  | "carbon";

export type SceneLook = {
  id: SceneId | "custom";
  name: string;
  background: string;
  floor: string;
  wall: string;
  shadow: string;
  hemiSky: string;
  hemiGround: string;
};

export const SCENES: SceneLook[] = [
  {
    id: "noche",
    name: "Noche",
    background: "#0c0c0e",
    floor: "#18181b",
    wall: "#141416",
    shadow: "#000000",
    hemiSky: "#e4e8f0",
    hemiGround: "#2a2622",
  },
  {
    id: "galeria",
    name: "Galería",
    background: "#efece6",
    floor: "#d9d4cb",
    wall: "#f6f4ef",
    shadow: "#6b6560",
    hemiSky: "#fffaf3",
    hemiGround: "#cfc6ba",
  },
  {
    id: "concreto",
    name: "Concreto",
    background: "#8d9398",
    floor: "#6d7378",
    wall: "#a1a7ab",
    shadow: "#2c3033",
    hemiSky: "#e7ecef",
    hemiGround: "#5c6166",
  },
  {
    id: "arena",
    name: "Arena",
    background: "#c9a27a",
    floor: "#a68460",
    wall: "#ddc2a2",
    shadow: "#4a3424",
    hemiSky: "#ffe8cc",
    hemiGround: "#8a6848",
  },
  {
    id: "oceano",
    name: "Océano",
    background: "#16324a",
    floor: "#102636",
    wall: "#1d425e",
    shadow: "#061018",
    hemiSky: "#c5dff0",
    hemiGround: "#0e2230",
  },
  {
    id: "bosque",
    name: "Bosque",
    background: "#1a2a22",
    floor: "#121e18",
    wall: "#24362c",
    shadow: "#050a08",
    hemiSky: "#d5eadc",
    hemiGround: "#1a2e22",
  },
  {
    id: "atardecer",
    name: "Atardecer",
    background: "#3a241c",
    floor: "#2a1812",
    wall: "#5a3428",
    shadow: "#140c08",
    hemiSky: "#ffd0b0",
    hemiGround: "#3a2218",
  },
  {
    id: "hielo",
    name: "Hielo",
    background: "#d7e6ee",
    floor: "#b7c9d4",
    wall: "#eaf3f7",
    shadow: "#5d727e",
    hemiSky: "#f4fbff",
    hemiGround: "#9eb4c2",
  },
  {
    id: "vino",
    name: "Vino",
    background: "#3a1220",
    floor: "#2a0c16",
    wall: "#54182c",
    shadow: "#14060a",
    hemiSky: "#f0c8d4",
    hemiGround: "#3a1822",
  },
  {
    id: "cobalto",
    name: "Cobalto",
    background: "#10183a",
    floor: "#0c122c",
    wall: "#1a2860",
    shadow: "#060814",
    hemiSky: "#c8d4ff",
    hemiGround: "#12182e",
  },
  {
    id: "magenta",
    name: "Magenta",
    background: "#2a1028",
    floor: "#1c0a1c",
    wall: "#4a1848",
    shadow: "#100610",
    hemiSky: "#ffc8f0",
    hemiGround: "#2a1428",
  },
  {
    id: "oro",
    name: "Oro",
    background: "#3a2c14",
    floor: "#2a200e",
    wall: "#5c4620",
    shadow: "#140e06",
    hemiSky: "#ffe4b0",
    hemiGround: "#3a2c16",
  },
  {
    id: "blanco",
    name: "Blanco",
    background: "#f4f4f2",
    floor: "#e4e4e0",
    wall: "#fafaf8",
    shadow: "#8a8a86",
    hemiSky: "#ffffff",
    hemiGround: "#d0d0cc",
  },
  {
    id: "rosa",
    name: "Rosa",
    background: "#f0d5d8",
    floor: "#e2bcc2",
    wall: "#f8e6e8",
    shadow: "#8a5c64",
    hemiSky: "#fff4f5",
    hemiGround: "#d8a8b0",
  },
  {
    id: "lima",
    name: "Lima",
    background: "#d7e38a",
    floor: "#b8c46a",
    wall: "#e8f0b0",
    shadow: "#4a5220",
    hemiSky: "#f6ffd0",
    hemiGround: "#8a9440",
  },
  {
    id: "carbon",
    name: "Carbón",
    background: "#1a1a1a",
    floor: "#111111",
    wall: "#262626",
    shadow: "#000000",
    hemiSky: "#d8d8d8",
    hemiGround: "#2a2a2a",
  },
];

function shade(hex: string, amount: number) {
  const n = hex.replace("#", "");
  const channel = (start: number) =>
    Math.round(Math.min(255, Math.max(0, parseInt(n.slice(start, start + 2), 16) * amount)));
  return `#${[0, 2, 4].map((start) => channel(start).toString(16).padStart(2, "0")).join("")}`;
}

export function lookFromColor(hex: string): SceneLook {
  return {
    id: "custom",
    name: "Color",
    background: hex,
    floor: shade(hex, 0.78),
    wall: shade(hex, 0.9),
    shadow: shade(hex, 0.25),
    hemiSky: shade(hex, 1.35),
    hemiGround: shade(hex, 0.55),
  };
}

export function getSceneLook(id: SceneId | "custom", color: string): SceneLook {
  if (id === "custom") return lookFromColor(color);
  return SCENES.find((scene) => scene.id === id) ?? SCENES[0]!;
}
