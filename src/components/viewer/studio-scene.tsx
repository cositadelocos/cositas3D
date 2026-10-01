import { ContactShadows } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useViewer, type LightPresetId } from "@/lib/viewer-store";
import { getSceneLook } from "@/lib/scenes";
import { LoadedModel } from "./loaded-model";
import { ShadeApplier } from "./shade-applier";

const SHADOW = {
  "shadow-mapSize": [512, 512] as [number, number],
  "shadow-camera-near": 1,
  "shadow-camera-far": 20,
  "shadow-camera-left": -5,
  "shadow-camera-right": 5,
  "shadow-camera-top": 5,
  "shadow-camera-bottom": -5,
  "shadow-bias": -0.0003,
};

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

  if (rig === "beauty") {
    return (
      <>
        <hemisphereLight args={["#fff8f2", "#d9d3cc", 0.7 * k]} />
        <ambientLight intensity={0.42 * k} />
        <directionalLight castShadow position={[0.2, 4.2, 6.2]} intensity={1.55 * k} color={white} {...SHADOW} />
        <directionalLight position={[-3.2, 3, 4]} intensity={1.05 * k} color={white} />
        <directionalLight position={[3.2, 2.6, 4]} intensity={0.95 * k} color={white} />
        <directionalLight position={[0, 5, -3]} intensity={0.3 * k} color="#ffffff" />
      </>
    );
  }

  if (rig === "drama") {
    return (
      <>
        <hemisphereLight args={["#c9d4e4", "#1a1c20", 0.12 * k]} />
        <ambientLight intensity={0.05 * k} />
        <directionalLight castShadow position={[6.5, 3.2, 1.2]} intensity={3.2 * k} color="#f7f8fb" {...SHADOW} />
        <directionalLight position={[-2.2, 4.2, -5.2]} intensity={1.7 * k} color="#9eb4d0" />
        <directionalLight position={[-2, 1.2, 4.5]} intensity={0.16 * k} color="#ffffff" />
      </>
    );
  }

  if (rig === "contraluz") {
    return (
      <>
        <hemisphereLight args={["#d5deea", "#20242c", 0.16 * k]} />
        <ambientLight intensity={0.06 * k} />
        <directionalLight castShadow position={[0.4, 4.6, -6.2]} intensity={3.3 * k} color="#f3f6fb" {...SHADOW} />
        <directionalLight position={[-4.2, 3.2, -2]} intensity={1.35 * k} color="#b9c7dc" />
        <directionalLight position={[0, 2.2, 5.4]} intensity={0.32 * k} color="#ffffff" />
      </>
    );
  }

  if (rig === "ventana") {
    return (
      <>
        <hemisphereLight args={["#e7f1ff", "#c8b8a4", 0.5 * k]} />
        <ambientLight intensity={0.16 * k} />
        <directionalLight castShadow position={[-6.2, 4.6, 2]} intensity={2.5 * k} color="#d7e7ff" {...SHADOW} />
        <directionalLight position={[3.4, 1.4, 2.2]} intensity={0.48 * k} color="#ffe4cc" />
      </>
    );
  }

  if (rig === "geles") {
    return (
      <>
        <hemisphereLight args={["#d8ecff", "#2a1424", 0.18 * k]} />
        <ambientLight intensity={0.06 * k} />
        <directionalLight castShadow position={[5.6, 3.1, 2]} intensity={2.7 * k} color="#3ad7ff" {...SHADOW} />
        <directionalLight position={[-5.2, 2.4, 1.6]} intensity={2.45 * k} color="#ff3dbe" />
        <directionalLight position={[0, 6.2, 0.4]} intensity={0.35 * k} color="#ffffff" />
      </>
    );
  }

  if (rig === "neon") {
    return (
      <>
        <hemisphereLight args={["#1c2430", "#10140f", 0.08 * k]} />
        <ambientLight intensity={0.04 * k} />
        <directionalLight castShadow position={[-2.2, 0.8, 4.2]} intensity={2.9 * k} color="#39ff9a" {...SHADOW} />
        <directionalLight position={[3.6, 2.4, -2.2]} intensity={2.2 * k} color="#9b5cff" />
        <directionalLight position={[0.2, 5, -4]} intensity={0.85 * k} color="#ff4ad2" />
      </>
    );
  }

  if (rig === "atardecer") {
    return (
      <>
        <hemisphereLight args={["#ffd0b0", "#3a2218", 0.32 * k]} />
        <ambientLight intensity={0.08 * k} color="#ffb080" />
        <directionalLight castShadow position={[-0.6, 1.35, 5.4]} intensity={2.8 * k} color="#ff8a3d" {...SHADOW} />
        <directionalLight position={[4.2, 3.2, -2]} intensity={0.75 * k} color="#7aa0ff" />
      </>
    );
  }

  if (rig === "nocturna") {
    return (
      <>
        <hemisphereLight args={["#1a2740", "#0c0e12", 0.06 * k]} />
        <ambientLight intensity={0.03 * k} />
        <spotLight
          castShadow
          position={[1.2, 6.4, 2.2]}
          angle={0.42}
          penumbra={0.65}
          intensity={18 * k}
          color="#d5e2ff"
          shadow-mapSize={[512, 512]}
          shadow-bias={-0.0003}
        />
        <directionalLight position={[-3.2, 2.4, -4.2]} intensity={0.45 * k} color="#4466aa" />
      </>
    );
  }

  if (rig === "anillo") {
    return (
      <>
        <hemisphereLight args={["#f7f7f5", "#d0d0cc", 0.55 * k]} />
        <ambientLight intensity={0.32 * k} />
        <directionalLight position={[4, 2.2, 2]} intensity={0.75 * k} color={white} />
        <directionalLight position={[-4, 2.2, 2]} intensity={0.75 * k} color={white} />
        <directionalLight position={[0, 2.2, 4.5]} intensity={0.7 * k} color={white} />
        <directionalLight position={[0, 2.4, -4.5]} intensity={0.55 * k} color={white} />
        <directionalLight castShadow position={[0.2, 6, 1]} intensity={0.7 * k} color={white} {...SHADOW} />
      </>
    );
  }

  return (
    <>
      <hemisphereLight args={["#e4e8f0", "#2a2622", 0.45 * k]} />
      <ambientLight intensity={0.2 * k} />
      <directionalLight castShadow position={[3.6, 5.6, 4]} intensity={2.05 * k} color={white} {...SHADOW} />
      <directionalLight position={[-4.2, 2.8, 2.8]} intensity={0.55 * k} color="#c5d0e0" />
      <directionalLight position={[0.4, 3.6, -4.8]} intensity={0.85 * k} color="#d5deea" />
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
