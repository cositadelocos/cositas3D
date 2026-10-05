import { ContactShadows } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useViewer, type LightPresetId } from "@/lib/viewer-store";
import { getSceneLook } from "@/lib/scenes";
import { LoadedModel } from "./loaded-model";
import { ShadeApplier } from "./shade-applier";

function tint(hex: string, warmth: number, allow: boolean) {
  if (!allow) return hex;
  return `#${new THREE.Color(hex).lerp(new THREE.Color("#ffc48a"), warmth * 0.7).getHexString()}`;
}

function RigLights({
  rig,
  intensity,
  warmth,
}: {
  rig: LightPresetId;
  intensity: number;
  warmth: number;
}) {
  const k = intensity;
  const white = tint("#f4f6fa", warmth, rig === "estudio" || rig === "beauty" || rig === "anillo");

  if (rig === "geles") {
    return (
      <>
        <hemisphereLight args={["#d8ecff", "#2a1424", 0.22 * k]} />
        <ambientLight intensity={0.12 * k} />
        <directionalLight position={[5.2, 3.1, 2]} intensity={2.4 * k} color="#3ad7ff" />
        <directionalLight position={[-5, 2.4, 1.6]} intensity={2.2 * k} color="#ff3dbe" />
      </>
    );
  }

  if (rig === "neon") {
    return (
      <>
        <hemisphereLight args={["#1c2430", "#10140f", 0.12 * k]} />
        <ambientLight intensity={0.08 * k} />
        <directionalLight position={[-2.2, 1.2, 4.2]} intensity={2.6 * k} color="#39ff9a" />
        <directionalLight position={[3.6, 2.4, -2.2]} intensity={2 * k} color="#9b5cff" />
      </>
    );
  }

  if (rig === "disco") {
    return (
      <>
        <hemisphereLight args={["#ffd0ea", "#241018", 0.2 * k]} />
        <ambientLight intensity={0.1 * k} />
        <directionalLight position={[4.8, 3.4, 2.2]} intensity={2.5 * k} color="#ff3dbe" />
        <directionalLight position={[-4.6, 2.2, 1.4]} intensity={2.2 * k} color="#ffe14a" />
      </>
    );
  }

  if (rig === "aurora") {
    return (
      <>
        <hemisphereLight args={["#c8fff0", "#102018", 0.22 * k]} />
        <ambientLight intensity={0.1 * k} />
        <directionalLight position={[-3.6, 5.2, 1.6]} intensity={2.4 * k} color="#3dffb0" />
        <directionalLight position={[4.2, 2.8, -2]} intensity={2 * k} color="#4aa8ff" />
      </>
    );
  }

  if (rig === "cyber") {
    return (
      <>
        <hemisphereLight args={["#c8f0ff", "#14081c", 0.18 * k]} />
        <ambientLight intensity={0.1 * k} />
        <directionalLight position={[2.4, 4.2, 5.4]} intensity={2.5 * k} color="#3ad7ff" />
        <directionalLight position={[-3.8, 3.2, -3.6]} intensity={2.1 * k} color="#9b5cff" />
      </>
    );
  }

  const looks: Record<string, { hemi: [string, string, number]; ambient: number; pos: [number, number, number]; color: string; key: number }> = {
    beauty: { hemi: ["#fff8f2", "#d9d3cc", 0.7], ambient: 0.45, pos: [0.2, 4.2, 6.2], color: white, key: 2.1 },
    drama: { hemi: ["#c9d4e4", "#1a1c20", 0.16], ambient: 0.08, pos: [6.5, 3.2, 1.2], color: "#f7f8fb", key: 3.2 },
    contraluz: { hemi: ["#d5deea", "#20242c", 0.2], ambient: 0.1, pos: [0.4, 4.6, -6.2], color: "#f3f6fb", key: 3.1 },
    ventana: { hemi: ["#e7f1ff", "#c8b8a4", 0.5], ambient: 0.2, pos: [-6.2, 4.6, 2], color: "#d7e7ff", key: 2.6 },
    atardecer: { hemi: ["#ffd0b0", "#3a2218", 0.35], ambient: 0.12, pos: [-0.6, 1.4, 5.4], color: "#ff8a3d", key: 2.8 },
    nocturna: { hemi: ["#1a2740", "#0c0e12", 0.1], ambient: 0.06, pos: [1.2, 6.2, 2.2], color: "#d5e2ff", key: 2.4 },
    anillo: { hemi: ["#f7f7f5", "#d0d0cc", 0.6], ambient: 0.4, pos: [0.2, 6, 3], color: white, key: 1.8 },
    fuego: { hemi: ["#ffc8a0", "#2a1008", 0.28], ambient: 0.1, pos: [1.2, 0.8, 4.4], color: "#ff6a22", key: 2.9 },
    luna: { hemi: ["#dce8ff", "#12161e", 0.42], ambient: 0.16, pos: [-4.4, 6.4, 1.2], color: "#cddcff", key: 2.3 },
    rayo: { hemi: ["#f4f6fa", "#1a1c20", 0.08], ambient: 0.04, pos: [0.4, 7.2, 3.2], color: "#ffffff", key: 3.6 },
    estudio: { hemi: ["#e4e8f0", "#2a2622", 0.5], ambient: 0.28, pos: [3.6, 5.6, 4], color: white, key: 2.2 },
  };
  const look = looks[rig] ?? looks.estudio!;

  return (
    <>
      <hemisphereLight args={[look.hemi[0], look.hemi[1], look.hemi[2] * k]} />
      <ambientLight intensity={look.ambient * k} />
      <directionalLight position={look.pos} intensity={look.key * k} color={look.color} />
    </>
  );
}

function SceneBackdrop({ color }: { color: string }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const next = new THREE.Color(color);
    scene.background = next;
    gl.setClearColor(next, 1);
  }, [color, gl, scene]);

  return null;
}

function StudioEnvironment({ intensity }: { intensity: number }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    pmrem.compileEquirectangularShader();
    const room = new RoomEnvironment();
    const rt = pmrem.fromScene(room, 0.04);
    room.dispose();
    scene.environment = rt.texture;
    return () => {
      if (scene.environment === rt.texture) scene.environment = null;
      rt.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useEffect(() => {
    scene.environmentIntensity = intensity;
  }, [intensity, scene]);

  return null;
}

const DEMO_URL = "/objeto-1.glb?v=3";

export function StudioScene({ productRef }: { productRef: RefObject<THREE.Group | null> }) {
  const finishId = useViewer((s) => s.finishId);
  const intensity = useViewer((s) => s.intensity);
  const warmth = useViewer((s) => s.warmth);
  const env = useViewer((s) => s.env);
  const preset = useViewer((s) => s.preset);
  const modelKind = useViewer((s) => s.modelKind);
  const modelUrl = useViewer((s) => s.modelUrl);
  const modelFormat = useViewer((s) => s.modelFormat);
  const modelExtras = useViewer((s) => s.modelExtras);
  const shadeMode = useViewer((s) => s.shadeMode);
  const showFloor = useViewer((s) => s.showFloor);
  const animMode = useViewer((s) => s.animMode);
  const explode = useViewer((s) => s.explode);
  const sceneId = useViewer((s) => s.sceneId);
  const sceneColor = useViewer((s) => s.sceneColor);
  const look = useMemo(() => getSceneLook(sceneId, sceneColor), [sceneId, sceneColor]);

  return (
    <>
      <SceneBackdrop color={look.background} />
      <StudioEnvironment intensity={env} />
      <RigLights rig={preset} intensity={intensity} warmth={warmth} />
      <group ref={productRef}>
        <LoadedModel
          url={modelKind === "file" && modelUrl ? modelUrl : DEMO_URL}
          format={modelKind === "file" && modelFormat ? modelFormat : "glb"}
          extras={modelKind === "file" ? modelExtras : null}
          finishId={finishId}
        />
      </group>
      <ShadeApplier rootRef={productRef} />
      <group userData={{ studio: true }}>
        {showFloor && shadeMode !== "mesh" && animMode === "none" && explode === 0 ? (
          <ContactShadows
            frames={1}
            position={[0, -0.5, 0]}
            opacity={0.45}
            scale={8}
            blur={2.4}
            far={3}
            resolution={256}
            color={look.shadow}
          />
        ) : null}
        {showFloor ? (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.502, 0]} receiveShadow>
            <circleGeometry args={[11, 64]} />
            <meshStandardMaterial color={look.floor} roughness={0.9} metalness={0.08} />
          </mesh>
        ) : null}
        <mesh position={[0, 2.6, -6.5]} receiveShadow>
          <planeGeometry args={[30, 16]} />
          <meshStandardMaterial color={look.wall} roughness={1} metalness={0} />
        </mesh>
      </group>
    </>
  );
}
