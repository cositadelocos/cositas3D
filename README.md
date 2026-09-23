# cositadelocos

**proyecto 3D** — visor personal para orbitar, inspeccionar y teñir modelos.

No es una tienda. No hay precios ni cuentas. Cargas un objeto, lo miras y listo.

La pieza de prueba se llama **objeto 1**.

## Qué hace

- Órbita, zoom y restablecer cámara
- Vistas: **malla**, **sólido**, **material**
- Color de malla
- Animaciones: plato giratorio, oscilar, saltar y girar
- Cubo de caras: frente, atrás, izquierda, derecha, arriba, abajo
- Lista de **partes** para mostrar u ocultar
- Despiece: separa las partes en los ejes X, Y o Z
- Exportar: GLB, glTF, STL y OBJ (FBX no, el navegador no puede generarlo)
- Foto en PNG (fondo transparente: malla = solo líneas, material = objeto) o JPEG del estudio, hasta 4K
- Iluminación: estudio, galería, foco, alba

## Formatos

| Formato | Notas |
|---|---|
| **GLB** | Recomendado. Fusion 360 y 3ds Max pueden exportarlo. Geometría, materiales y texturas |
| **FBX** | Lo que suelen soltar Fusion y 3ds Max |
| glTF | Acepta `.gltf` y archivos extra (bin, imágenes) |
| OBJ | Malla. Materiales limitados |
| STL | Solo geometría |
| 3DS | Malla antigua de 3ds Max |

El archivo nativo no entra: ni `.f3d`, ni `.max`, ni STEP. En Fusion: Archivo → Exportar → FBX o glTF. En 3ds Max: Exportar → FBX o GLB.

En pantalla el objeto se encuadra para que el zoom y el despiece funcionen. Eso no se exporta.

La unidad de la app es el **milímetro**:

- STL, OBJ y 3DS se leen como mm
- FBX usa la unidad que trae el archivo y se pasa a mm
- GLB / glTF (el estándar habla en metros) se pasa a mm

Al exportar, el archivo sale en milímetros. El control **Encuadre** solo afecta la vista.

Máximo **50 MB**. Lo que subes vive solo en el navegador: no se guarda en el servidor ni viaja con el repo.

## Arrancar

Node **22**.

```bash
npm install --legacy-peer-deps
npm run dev
```

Abre la URL que imprima Vite (por defecto el puerto 8080).

```bash
npm run build      # producción
npm run typecheck
```

## Subirlo a GitHub

```bash
git init
git add .
git commit -m "cositadelocos visor 3D"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

Luego puedes publicarlo en Vercel u otro host compatible con Vite.

## Cómo se usa

1. Arrastra un GLB (u OBJ / STL) al estudio, o pulsa **Cargar modelo**.
2. Elige vista: malla / sólido / material.
3. Anima, cambia la luz o encuadra una cara con el cubo.
4. En el panel: oculta partes, mira UVs y descarga mapas o el JSON del material.
5. **Captura** guarda una imagen. **Cámara** vuelve al encuadre inicial.

Atajos: `R` restablece la cámara · `C` captura.

## Dónde está el código

```
src/routes/index.tsx              entrada
src/components/viewer/            estudio 3D, canvas, panel, cubo
src/lib/viewer-store.ts           estado
src/lib/shade.ts                  malla / sólido / material
src/lib/inspect.ts                partes, UVs, materiales
src/lib/camera.ts                 encuadre y caras
src/lib/brand.ts                  nombre y subtítulo
public/og.jpg                     tarjeta de enlace
```

El resto (`scripts/`, `server/`, `auth/`) es andamiaje. El visor no usa cuentas ni base de datos.

## Stack

React 19 · TanStack Start · Three.js · React Three Fiber · Zustand · Tailwind v4
