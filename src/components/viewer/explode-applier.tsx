import { useFrame } from "@react-three/fiber";
import type { RefObject } from "react";
import * as THREE from "three";
import { useViewer } from "@/lib/viewer-store";

const _box = new THREE.Box3();
const _center = new THREE.Vector3();
const _part = new THREE.Vector3();
const _offset = new THREE.Vector3();
const _local = new THREE.Vector3();
const _world = new THREE.Vector3();

export function ExplodeApplier({ rootRef }: { rootRef: RefObject<THREE.Group | null> }) {
  useFrame(() => {
    const root = rootRef.current;
    if (!root) return;

    const meshes: THREE.Mesh[] = [];
    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (!mesh.userData.restLocal) mesh.userData.restLocal = mesh.position.clone();
      mesh.position.copy(mesh.userData.restLocal as THREE.Vector3);
      meshes.push(mesh);
    });

    const { explode, explodeAxes } = useViewer.getState();
    const amount = explode / 100;
    const anyAxis = explodeAxes.x || explodeAxes.y || explodeAxes.z;
    if (amount <= 0 || !anyAxis || meshes.length < 2) return;

    root.updateWorldMatrix(true, true);
    _box.makeEmpty();
    for (const mesh of meshes) {
      if (!mesh.visible) continue;
      _box.expandByObject(mesh);
    }
    if (_box.isEmpty()) return;
    _box.getCenter(_center);

    const buckets = new Map<string, THREE.Mesh[]>();
    for (const mesh of meshes) {
      const id = (mesh.userData.partId as string | undefined) ?? mesh.uuid;
      const list = buckets.get(id) ?? [];
      list.push(mesh);
      buckets.set(id, list);
    }

    for (const group of buckets.values()) {
      _part.set(0, 0, 0);
      let counted = 0;
      for (const mesh of group) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const bounds = mesh.geometry.boundingBox;
        if (!bounds) continue;
        bounds.getCenter(_local);
        _local.applyMatrix4(mesh.matrixWorld);
        _part.add(_local);
        counted += 1;
      }
      if (!counted) continue;
      _part.multiplyScalar(1 / counted);

      // World axes, the same ones the corner gizmo draws: X red, Y green, Z blue.
      _offset.set(
        explodeAxes.x ? _part.x - _center.x : 0,
        explodeAxes.y ? _part.y - _center.y : 0,
        explodeAxes.z ? _part.z - _center.z : 0,
      );
      _offset.multiplyScalar(amount);
      if (_offset.lengthSq() < 1e-10) continue;

      for (const mesh of group) {
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
