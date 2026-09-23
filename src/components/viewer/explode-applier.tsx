import { useFrame } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useViewer } from "@/lib/viewer-store";

const _box = new THREE.Box3();
const _size = new THREE.Vector3();
const _center = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _local = new THREE.Vector3();
const _world = new THREE.Vector3();
const _pool: THREE.Vector3[] = [];
let _cursor = 0;

type Bucket = { id: string; meshes: THREE.Mesh[]; center: THREE.Vector3 };

function takeVec() {
  const vec = _pool[_cursor] ?? new THREE.Vector3();
  _pool[_cursor] = vec;
  _cursor += 1;
  return vec;
}

function shiftOnAxis(parts: Bucket[], axis: "x" | "y" | "z", reach: number, modelSize: number, amount: number) {
  const shifts = new Map<string, number>();
  if (parts.length < 2 || reach <= 0) return shifts;

  const ordered = [...parts].sort((a, b) => a.center[axis] - b.center[axis] || a.id.localeCompare(b.id));
  let min = Infinity;
  let max = -Infinity;
  for (const part of ordered) {
    min = Math.min(min, part.center[axis]);
    max = Math.max(max, part.center[axis]);
  }
  const span = max - min;
  const flat = span < modelSize * 0.08;

  ordered.forEach((part, index) => {
    if (flat) {
      const t = ordered.length === 1 ? 0 : index / (ordered.length - 1) - 0.5;
      shifts.set(part.id, t * 2 * reach);
      return;
    }
    shifts.set(part.id, (part.center[axis] - _center[axis]) * amount);
  });
  return shifts;
}

export function ExplodeApplier({ rootRef }: { rootRef: RefObject<THREE.Group | null> }) {
  const wasOn = useRef(false);

  useFrame(() => {
    const root = rootRef.current;
    if (!root) return;

    const { explode, explodeAxes } = useViewer.getState();
    const amount = explode / 100;
    const active = amount > 0 && (explodeAxes.x || explodeAxes.y || explodeAxes.z);
    if (!active) {
      if (!wasOn.current) return;
      wasOn.current = false;
      root.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh || !mesh.userData.restLocal) return;
        mesh.position.copy(mesh.userData.restLocal as THREE.Vector3);
      });
      return;
    }
    wasOn.current = true;

    const meshes: THREE.Mesh[] = [];
    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (!mesh.userData.restLocal) mesh.userData.restLocal = mesh.position.clone();
      mesh.position.copy(mesh.userData.restLocal as THREE.Vector3);
      meshes.push(mesh);
    });

    if (meshes.length < 2) return;

    root.updateWorldMatrix(true, true);
    _box.makeEmpty();
    for (const mesh of meshes) {
      if (!mesh.visible) continue;
      _box.expandByObject(mesh);
    }
    if (_box.isEmpty()) return;
    _box.getCenter(_center);
    _box.getSize(_size);
    const modelSize = Math.max(_size.x, _size.y, _size.z, 1e-4);
    const reach = modelSize * amount * 0.55;

    const groups = new Map<string, THREE.Mesh[]>();
    for (const mesh of meshes) {
      const id = (mesh.userData.partId as string | undefined) ?? mesh.uuid;
      const list = groups.get(id) ?? [];
      list.push(mesh);
      groups.set(id, list);
    }
    if (groups.size < 2) return;

    _cursor = 0;
    const parts: Bucket[] = [];
    for (const [id, group] of groups) {
      const center = takeVec().set(0, 0, 0);
      let counted = 0;
      for (const mesh of group) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const bounds = mesh.geometry.boundingBox;
        if (!bounds) continue;
        bounds.getCenter(_local);
        _local.applyMatrix4(mesh.matrixWorld);
        center.add(_local);
        counted += 1;
      }
      if (!counted) continue;
      center.multiplyScalar(1 / counted);
      parts.push({ id, meshes: group, center });
    }
    if (parts.length < 2) return;

    const shiftX = explodeAxes.x ? shiftOnAxis(parts, "x", reach, modelSize, amount) : null;
    const shiftY = explodeAxes.y ? shiftOnAxis(parts, "y", reach, modelSize, amount) : null;
    const shiftZ = explodeAxes.z ? shiftOnAxis(parts, "z", reach, modelSize, amount) : null;

    for (const part of parts) {
      _offset.set(shiftX?.get(part.id) ?? 0, shiftY?.get(part.id) ?? 0, shiftZ?.get(part.id) ?? 0);
      if (_offset.lengthSq() < 1e-10) continue;

      for (const mesh of part.meshes) {
        const parent = mesh.parent;
        if (!parent) continue;
        mesh.getWorldPosition(_world);
        _world.add(_offset);
        parent.worldToLocal(_world);
        mesh.position.copy(_world);
      }
    }
  });

  return null;
}
