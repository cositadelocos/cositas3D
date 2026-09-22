import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { writeFileSync } from "node:fs";

const scene = new THREE.Scene();
const mesh = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.55, 0.18, 96, 18),
  new THREE.MeshStandardMaterial({ color: 0xb7c0cc, metalness: 0.85, roughness: 0.28 }),
);
scene.add(mesh);

const exporter = new GLTFExporter();
const result = await exporter.parseAsync(scene, { binary: true });
const bytes = result instanceof ArrayBuffer ? Buffer.from(result) : Buffer.from(JSON.stringify(result));
writeFileSync("/tmp/knot.glb", bytes);
console.log("wrote", bytes.length, "bytes");
