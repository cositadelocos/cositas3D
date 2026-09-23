import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getFinish, type Finish } from "@/lib/finishes";
import { getStudioTextures } from "./studio-textures";
import { useViewer } from "@/lib/viewer-store";

const SPAN = 1.14;
const _color = new THREE.Color();
const INITIAL = getFinish("graphite");

function makeHeadband(radiusX: number, radiusY: number, lift: number, from = 0.22, to = Math.PI - 0.22) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 56; i++) {
    const t = i / 56;
    const a = from + t * (to - from);
    points.push(new THREE.Vector3(Math.cos(a) * radiusX, Math.sin(a) * radiusY + lift, 0));
  }
  return new THREE.CatmullRomCurve3(points);
}

function makeCupProfile() {
  return [
    new THREE.Vector2(0.12, -0.1),
    new THREE.Vector2(0.3, -0.1),
    new THREE.Vector2(0.36, -0.08),
    new THREE.Vector2(0.4, -0.03),
    new THREE.Vector2(0.412, 0.03),
    new THREE.Vector2(0.39, 0.09),
    new THREE.Vector2(0.3, 0.128),
    new THREE.Vector2(0.14, 0.14),
    new THREE.Vector2(0.02, 0.132),
  ];
}

function lerpMaterial(
  mat: THREE.MeshPhysicalMaterial,
  finish: Finish,
  key: "metal" | "cushion" | "inner" | "hardware",
  t: number,
) {
  const hex =
    key === "metal"
      ? finish.metal
      : key === "cushion"
        ? finish.cushion
        : key === "inner"
          ? finish.inner
          : finish.hardware;
  _color.set(hex);
  mat.color.lerp(_color, t);
  if (key === "metal") {
    mat.metalness += (finish.metalness - mat.metalness) * t;
    mat.roughness += (finish.roughness - mat.roughness) * t;
    mat.clearcoat += (finish.clearcoat - mat.clearcoat) * t;
    mat.clearcoatRoughness += (finish.clearcoatRoughness - mat.clearcoatRoughness) * t;
    mat.envMapIntensity += (finish.envMapIntensity - mat.envMapIntensity) * t;
    _color.set(finish.emissive);
    mat.emissive.lerp(_color, t);
    mat.emissiveIntensity += (finish.emissiveIntensity - mat.emissiveIntensity) * t;
  }
}

function useFinishMaterials(finish: Finish) {
  const textures = useMemo(() => getStudioTextures(), []);
  const metal = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: INITIAL.metal,
        metalness: INITIAL.metalness,
        roughness: INITIAL.roughness,
        clearcoat: INITIAL.clearcoat,
        clearcoatRoughness: 0.22,
        roughnessMap: textures.brushed,
        envMapIntensity: 1.15,
        emissive: new THREE.Color("#1a1c20"),
        emissiveIntensity: 0.12,
      }),
    [textures],
  );
  const cushion = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: INITIAL.cushion,
        metalness: 0.04,
        roughness: 0.82,
        roughnessMap: textures.grain,
        sheen: 0.55,
        sheenRoughness: 0.6,
        sheenColor: new THREE.Color("#2a2a2c"),
        envMapIntensity: 0.4,
      }),
    [textures],
  );
  const inner = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: INITIAL.inner,
        metalness: 0.35,
        roughness: 0.45,
        envMapIntensity: 0.7,
      }),
    [],
  );
  const hardware = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: INITIAL.hardware,
        metalness: 0.92,
        roughness: 0.18,
        clearcoat: 0.8,
        clearcoatRoughness: 0.12,
      }),
    [],
  );

  const finishRef = useRef(finish);
  finishRef.current = finish;

  useFrame((_, delta) => {
    if (useViewer.getState().shadeMode !== "material") return;
    const step = 1 - Math.exp(-Math.min(delta, 0.1) * 9);
    const next = finishRef.current;
    lerpMaterial(metal, next, "metal", step);
    lerpMaterial(cushion, next, "cushion", step);
    lerpMaterial(inner, next, "inner", step);
    lerpMaterial(hardware, next, "hardware", step);
  });

  useEffect(() => {
    return () => {
      metal.dispose();
      cushion.dispose();
      inner.dispose();
      hardware.dispose();
    };
  }, [metal, cushion, inner, hardware]);

  return { metal, cushion, inner, hardware };
}

function EarCup({
  side,
  metal,
  cushion,
  inner,
  hardware,
}: {
  side: 1 | -1;
  metal: THREE.MeshPhysicalMaterial;
  cushion: THREE.MeshPhysicalMaterial;
  inner: THREE.MeshPhysicalMaterial;
  hardware: THREE.MeshPhysicalMaterial;
}) {
  const profile = useMemo(() => makeCupProfile(), []);

  return (
    <group name={side === 1 ? "capsula-derecha" : "capsula-izquierda"} position={[side * SPAN, 0.04, 0]} rotation={[0, 0, -side * 0.12]}>
      <group rotation={[0, 0, -side * (Math.PI / 2)]}>
        <mesh material={metal} castShadow receiveShadow>
          <latheGeometry args={[profile, 64]} />
        </mesh>
        <mesh material={hardware} position={[0, 0.136, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <circleGeometry args={[0.09, 32]} />
        </mesh>
        <mesh material={inner} position={[0, 0.137, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.028, 0.072, 24]} />
        </mesh>
        <mesh material={cushion} position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.236, 0.078, 22, 48]} />
        </mesh>
        <mesh material={cushion} position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.236, 0.236, 0.05, 48]} />
        </mesh>
        <mesh material={inner} position={[0, -0.078, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.168, 40]} />
        </mesh>
        <mesh material={hardware} position={[0, -0.074, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.118, 0.132, 40]} />
        </mesh>
        <mesh material={hardware} position={[0, -0.074, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.07, 0.082, 32]} />
        </mesh>
        <mesh material={inner} position={[0, -0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.036, 24]} />
        </mesh>
      </group>
    </group>
  );
}

function Yoke({
  side,
  metal,
  hardware,
}: {
  side: 1 | -1;
  metal: THREE.MeshPhysicalMaterial;
  hardware: THREE.MeshPhysicalMaterial;
}) {
  return (
    <group name={side === 1 ? "yugo-derecho" : "yugo-izquierdo"} position={[side * (SPAN - 0.02), 0.38, 0]}>
      <mesh material={metal} castShadow>
        <boxGeometry args={[0.07, 0.46, 0.042]} />
      </mesh>
      <mesh material={hardware} position={[0, -0.18, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 0.086, 20]} />
      </mesh>
      <mesh material={metal} position={[side * 0.02, -0.26, 0]} rotation={[0, 0, side * 0.4]} castShadow>
        <boxGeometry args={[0.055, 0.16, 0.04]} />
      </mesh>
    </group>
  );
}

export function HeadphoneModel({ finishId }: { finishId: string }) {
  const finish = getFinish(finishId);
  const { metal, cushion, inner, hardware } = useFinishMaterials(finish);
  const band = useMemo(() => makeHeadband(1.12, 1.08, 0.08), []);
  const pad = useMemo(() => makeHeadband(1.05, 1.0, 0.06, 0.42, Math.PI - 0.42), []);

  return (
    <group name="objeto-1" userData={{ exportSource: true }}>
      <mesh name="diadema" material={metal} castShadow receiveShadow>
        <tubeGeometry args={[band, 72, 0.052, 18, false]} />
      </mesh>
      <mesh name="almohadilla-diadema" material={cushion} castShadow>
        <tubeGeometry args={[pad, 48, 0.062, 16, false]} />
      </mesh>
      <Yoke side={-1} metal={metal} hardware={hardware} />
      <Yoke side={1} metal={metal} hardware={hardware} />
      <EarCup side={-1} metal={metal} cushion={cushion} inner={inner} hardware={hardware} />
      <EarCup side={1} metal={metal} cushion={cushion} inner={inner} hardware={hardware} />
    </group>
  );
}
