import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useViewer } from "@/lib/viewer-store";

function findAnimated(root: THREE.Object3D | null): THREE.Object3D | null {
  const hits: THREE.Object3D[] = [];
  root?.traverse((child) => {
    const clips = child.userData.clips as THREE.AnimationClip[] | undefined;
    if (clips?.length) hits.push(child);
  });
  return hits[0] ?? null;
}

export function ClipPlayer({ rootRef }: { rootRef: RefObject<THREE.Group | null> }) {
  const actionRef = useRef<THREE.AnimationAction | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const fileClips = useViewer((s) => s.fileClips);
  const clipIndex = useViewer((s) => s.clipIndex);
  const clipLoop = useViewer((s) => s.clipLoop);
  const modelStatus = useViewer((s) => s.modelStatus);

  useEffect(() => {
    const host = findAnimated(rootRef.current);
    const clips = host?.userData.clips as THREE.AnimationClip[] | undefined;
    actionRef.current = null;
    mixerRef.current?.stopAllAction();
    mixerRef.current = null;
    if (!host || !clips?.length) return;

    const clip = clips[Math.min(clipIndex, clips.length - 1)];
    if (!clip) return;

    const mixer = new THREE.AnimationMixer(host);
    const action = mixer.clipAction(clip);
    const { clipLoop: loop, clipPlaying, clipSpeed } = useViewer.getState();
    action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
    action.clampWhenFinished = !loop;
    action.timeScale = clipSpeed;
    action.play();
    action.paused = !clipPlaying;

    const onDone = () => useViewer.getState().setClipPlaying(false);
    mixer.addEventListener("finished", onDone);
    mixerRef.current = mixer;
    actionRef.current = action;

    return () => {
      mixer.removeEventListener("finished", onDone);
      mixer.stopAllAction();
      if (mixerRef.current === mixer) mixerRef.current = null;
      actionRef.current = null;
    };
  }, [fileClips, clipIndex, clipLoop, modelStatus, rootRef]);

  const clipPlaying = useViewer((s) => s.clipPlaying);
  const clipSpeed = useViewer((s) => s.clipSpeed);

  useEffect(() => {
    const action = actionRef.current;
    if (!action) return;
    action.timeScale = clipSpeed;
    if (!clipPlaying) {
      action.paused = true;
      return;
    }
    const clip = action.getClip();
    if (action.time >= clip.duration - 1e-3) action.reset();
    action.paused = false;
    action.play();
  }, [clipPlaying, clipSpeed]);

  useFrame((_, delta) => {
    if (!useViewer.getState().clipPlaying) return;
    mixerRef.current?.update(delta);
  });

  return null;
}
