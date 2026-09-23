import { ContactShadows } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useViewer, type LightPresetId } from "@/lib/viewer-store";
import { getSceneLook } from "@/lib/scenes";
import { LoadedModel } from "./loaded-model";
import { ShadeApplier } from "./shade-applier";

const KEY_POS: Record<LightPresetId | "custom", [number, number, number]> = {
  estudio: [3.6, 5.6, 4.0],
  galeria: [-3.4, 4.8, 3.4],
  foco: [1.8, 6.6, 1.4],
  alba: [-1.6, 4.0, 4.8],
  custom: [3.6, 5.6, 4.0],
};

function SceneBackdrop({ color }: { color: string }) {
  const { gl, scene } = useThree();

  useEffect(() => {
    const next = new THREE.Color(color);
    scene.background = next;
    gl.setClearColor(next, 1);
  }, [color, gl, scene]);

  return null;
}
function mixKeyColor(warmth: number) {
  return new THREE.Color("#f2f4f8").lerp(new THREE.Color("#ffd2a6"), warmth);
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

const DEMO_URL = "/objeto-1.glb?v=2";

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
  const sceneId = useViewer((s) => s.sceneId);
  const sceneColor = useViewer((s) => s.sceneColor);
  const look = useMemo(() => getSceneLook(sceneId, sceneColor), [sceneId, sceneColor]);
  const keyColor = useMemo(() => mixKeyColor(warmth), [warmth]);
  const pos = KEY_POS[preset];

  return (
    <>
      <SceneBackdrop color={look.background} />
      <StudioEnvironment intensity={env} />
      <hemisphereLight args={[look.hemiSky, look.hemiGround, 0.55 * intensity]} />
      <ambientLight intensity={0.28 * intensity} />
      <directionalLight
        castShadow
        position={pos}
        intensity={2.1 * intensity}
        color={keyColor}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0003}
      />
      <directionalLight position={[-4.2, 2.8, 2.8]} intensity={0.55 * intensity} color="#c5d0e0" />
      <directionalLight position={[0.4, 3.6, -4.8]} intensity={0.7 * intensity} color="#b7c2d2" />
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
        {shadeMode === "mesh" ? null : (
          <ContactShadows position={[0, -0.5, 0]} opacity={0.45} scale={8} blur={2.8} far={3} color={look.shadow} />
        )}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.502, 0]} receiveShadow>
          <circleGeometry args={[11, 64]} />
          <meshStandardMaterial color={look.floor} roughness={0.9} metalness={0.08} />
        </mesh>
        <mesh position={[0, 2.6, -6.5]} receiveShadow>
          <planeGeometry args={[30, 16]} />
          <meshStandardMaterial color={look.wall} roughness={1} metalness={0} />
        </mesh>
      </group>
    </>
  );
}
