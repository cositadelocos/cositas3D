import { useEffect, type RefObject } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";
import { useViewer } from "@/lib/viewer-store";

function fileSafe(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-|-$/g, "") || "modelo"
  );
}

function exportSource(root: THREE.Object3D) {
  let found: THREE.Object3D | null = null;
  root.traverse((child) => {
    if (child.userData.exportSource) found = child;
  });
  const live = found ?? root;
  const clone = live.clone(true);
  clone.updateWorldMatrix(true, true);
  return clone;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportBridge({ rootRef }: { rootRef: RefObject<THREE.Group | null> }) {
  const exportToken = useViewer((s) => s.exportToken);

  useEffect(() => {
    if (!exportToken) return;
    const root = rootRef.current;
    const { exportFormat, modelName, setExportNote } = useViewer.getState();
    if (!root) {
      setExportNote("No hay modelo para exportar.");
      return;
    }

    const name = fileSafe(modelName);
    const source = exportSource(root);

    try {
      if (exportFormat === "stl") {
        const data = new STLExporter().parse(source, { binary: true });
        const bytes =
          data instanceof DataView
            ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
            : data;
        saveBlob(new Blob([bytes], { type: "model/stl" }), `${name}.stl`);
        setExportNote("STL en milímetros. Solo geometría.");
        return;
      }

      if (exportFormat === "obj") {
        const text = new OBJExporter().parse(source);
        saveBlob(new Blob([text], { type: "text/plain" }), `${name}.obj`);
        setExportNote("OBJ en milímetros. Sin texturas.");
        return;
      }

      const exporter = new GLTFExporter();
      exporter.parse(
        source,
        (result) => {
          if (exportFormat === "glb" && result instanceof ArrayBuffer) {
            saveBlob(new Blob([result], { type: "model/gltf-binary" }), `${name}.glb`);
            setExportNote("GLB en milímetros, con materiales.");
            return;
          }
          saveBlob(
            new Blob([JSON.stringify(result)], { type: "model/gltf+json" }),
            `${name}.gltf`,
          );
          setExportNote("glTF en milímetros.");
        },
        (error) => {
          setExportNote(error instanceof Error ? error.message : "No se pudo exportar.");
        },
        { binary: exportFormat === "glb", onlyVisible: true, trs: true },
      );
    } catch (error) {
      setExportNote(error instanceof Error ? error.message : "No se pudo exportar.");
    }
  }, [exportToken, rootRef]);

  return null;
}
