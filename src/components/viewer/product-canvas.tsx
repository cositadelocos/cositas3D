import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { CAMERA, VIEW_DIRS, distanceToZoom, viewSpan, zoomToDistance } from "@/lib/camera";
import { useViewer } from "@/lib/viewer-store";
import { CaptureBridge } from "./capture-bridge";
import { ExplodeApplier } from "./explode-applier";
import { ExportBridge } from "./export-bridge";
import { InspectSync } from "./inspect-sync";
import { ModelAnimator } from "./model-animator";
import { StudioScene } from "./studio-scene";

type ControlsHandle = {
  object: THREE.Object3D;
  target: THREE.Vector3;
  update: () => void;
  getDistance: () => number;
};

function applyDistance(controls: ControlsHandle, zoom: number, frame: number) {
  const cam = controls.object;
  const dist = zoomToDistance(zoom, frame);
  const dir = new THREE.Vector3().subVectors(cam.position, controls.target);
  if (dir.lengthSq() < 1e-6) dir.set(CAMERA.position[0], CAMERA.position[1], CAMERA.position[2]);
  dir.setLength(dist);
  cam.position.copy(controls.target).add(dir);
  controls.update();
}

function applyView(controls: ControlsHandle, face: keyof typeof VIEW_DIRS, zoom: number, frame: number) {
  const dist = zoomToDistance(zoom, frame);
  const dir = new THREE.Vector3(...VIEW_DIRS[face]).normalize().multiplyScalar(dist);
  controls.target.set(...CAMERA.target);
  controls.object.position.copy(controls.target).add(dir);
  controls.update();
}

function CameraRig({ controlsRef }: { controlsRef: RefObject<ControlsHandle | null> }) {
  const zoom = useViewer((s) => s.zoom);
  const frame = useViewer((s) => s.frame);
  const resetToken = useViewer((s) => s.resetToken);
  const viewFace = useViewer((s) => s.viewFace);
  const viewToken = useViewer((s) => s.viewToken);
  const setZoom = useViewer((s) => s.setZoom);
  const { gl } = useThree();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const controls = controlsRef.current;
      if (!controls) return;
      controls.object.position.set(...CAMERA.position);
      controls.target.set(...CAMERA.target);
      applyDistance(controls, useViewer.getState().zoom, useViewer.getState().frame);
    });
    return () => cancelAnimationFrame(frame);
  }, [resetToken, controlsRef]);

  useEffect(() => {
    if (!viewToken || viewFace === "orbit") return;
    const controls = controlsRef.current;
    if (!controls) return;
    applyView(controls, viewFace, useViewer.getState().zoom, useViewer.getState().frame);
  }, [viewToken, viewFace, controlsRef]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    applyDistance(controls, zoom, frame);
  }, [zoom, frame, controlsRef]);

  useEffect(() => {
    const el = gl.domElement;
    const sync = () => {
      const controls = controlsRef.current;
      if (!controls) return;
      const next = distanceToZoom(controls.getDistance(), useViewer.getState().frame);
      if (Math.abs(next - useViewer.getState().zoom) > 0.75) setZoom(next);
    };
    el.addEventListener("pointerup", sync);
    el.addEventListener("wheel", sync, { passive: true });
    return () => {
      el.removeEventListener("pointerup", sync);
      el.removeEventListener("wheel", sync);
    };
  }, [gl, controlsRef, setZoom]);

  return null;
}

function Stage() {
  const productRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<ControlsHandle | null>(null);
  const frame = useViewer((s) => s.frame);
  const span = viewSpan(frame);

  return (
    <>
      <StudioScene productRef={productRef} />
      <ModelAnimator rootRef={productRef} />
      <ExplodeApplier rootRef={productRef} />
      <InspectSync rootRef={productRef} />
      <CaptureBridge />
      <ExportBridge rootRef={productRef} />
      <OrbitControls
        ref={controlsRef as never}
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        autoRotate={false}
        minDistance={span.min}
        maxDistance={span.max}
        minPolarAngle={CAMERA.minPolar}
        maxPolarAngle={CAMERA.maxPolar}
        rotateSpeed={0.72}
        zoomSpeed={0.7}
      />
      <GizmoHelper alignment="top-right" margin={[28, 76]}>
        <GizmoViewport
          disabled
          scale={22}
          hideNegativeAxes
          axisColors={["#e5484d", "#30a46c", "#3b82f6"]}
          labelColor="#ffffff"
          labels={["X", "Y", "Z"]}
          axisHeadScale={0.85}
        />
      </GizmoHelper>
      <CameraRig controlsRef={controlsRef} />
    </>
  );
}

export function ProductCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-full bg-background" aria-hidden="true" />;
  }

  return (
    <Canvas
      className="touch-none"
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [...CAMERA.position], fov: CAMERA.fov, near: 0.1, far: 40 }}
      gl={{
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      onCreated={({ gl, scene }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFShadowMap;
        gl.setClearColor("#0c0c0e", 1);
        scene.background = new THREE.Color("#0c0c0e");
      }}
    >
      <Stage />
    </Canvas>
  );
}
