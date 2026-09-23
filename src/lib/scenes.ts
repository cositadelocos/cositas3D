export type SceneId =
  | "noche"
  | "galeria"
  | "concreto"
  | "arena"
  | "oceano"
  | "bosque"
  | "atardecer"
  | "hielo";

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
