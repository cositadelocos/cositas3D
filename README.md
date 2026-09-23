# cositadelocos

**proyecto 3D.** Un visor para mirar un modelo, sacarle fotos limpias y abrirlo en despiece.

No es una tienda. No hay precios ni cuentas. El archivo se queda en el navegador: no se guarda en un servidor.

La pieza de prueba se llama **objeto 1**.

## Para qué sirve

Cargas un objeto y lo orbitas. Puedes verlo con su material, en sólido o solo en **malla**. Desde ahí salen las dos cosas que más se usan:

- **La captura en malla.** Una foto de las líneas del modelo, sin el estudio detrás. Sirve para láminas, posts y para mostrar la geometría sin que el fondo estorbe.
- **La foto del objeto.** La misma captura, pero con el material o el color sólido.
- **El despiece.** Separa las partes en X, Y o Z para explicar cómo está armado.

El gizmo de la esquina (X rojo, Y verde, Z azul) es solo orientación. Y apunta hacia arriba.

## Cómo se usa

1. Arrastra el archivo al estudio o pulsa **Cargar modelo**.
2. Orbita con el dedo o el mouse. El zoom está en el panel. **Cámara** (o la tecla `R`) vuelve al encuadre inicial.
3. Elige la vista: **Malla**, **Sólido** o **Material**.
4. Si vas a sacar una lámina de la geometría, deja **Malla**, elige **PNG** y pulsa **Captura** (o la tecla `C`).
5. Si quieres el objeto con su aspecto, deja **Material** o **Sólido** y captura igual.
6. Para el despiece, abre **Despiece**, enciende los ejes que quieras y sube el control.

En el iPhone la captura no se baja sola. Se abre la imagen encima: pulsa **Guardar** o mantén el dedo y elige **Guardar en fotos**.

## La captura en malla

Es la vista que deja solo las aristas.

1. Vista **Malla**.
2. Si quieres, cambia el **color de malla**.
3. Formato **PNG**.
4. Tamaño **Vista**, **2K** o **4K**. En el iPhone el lado largo se queda en 2048 px para que el teléfono no se quede sin memoria.
5. **Captura**.

El PNG sale con **fondo transparente** y **solo las líneas**. No entra el piso, ni la pared, ni el escenario. Se puede poner encima de otro fondo, en una lámina o en una publicación.

Eso es distinto de la foto con material: ahí se ve la superficie, no el alambrado.

## La foto del objeto

Misma tecla **Captura**. Cambia lo que sale según la vista y el formato.

| Vista | PNG | JPEG |
|---|---|---|
| **Malla** | Solo líneas, fondo transparente | El encuadre completo, con el estudio detrás |
| **Sólido** | El objeto en un color, fondo transparente | El estudio completo |
| **Material** | El objeto con su material, fondo transparente, sin escenario | El estudio completo |

El JPEG es la postal del escenario. El PNG es el recorte del modelo, listo para componer.

## El despiece

Separa las **partes** desde el centro del objeto.

- **Eje X** (rojo), **Eje Y** (verde), **Eje Z** (azul). Cada uno se puede apagar. El movimiento sigue al gizmo.
- Si el modelo es casi plano en un eje, igual se abre en esa dirección. Si no, en Z no se notaría nada.
- El control va de 0 a 100.
- En **Partes** se puede ocultar una pieza para ver las demás solas.
- Si exportas con el despiece abierto, el archivo sale **ya separado**. El encuadre de la pantalla no se guarda.

## Qué se puede subir

Máximo **50 MB**.

| Formato | Qué trae |
|---|---|
| **GLB** | El más útil. Geometría, materiales y texturas |
| **glTF** | Igual que GLB, pero suelto. Puedes soltar también el `.bin` y las imágenes |
| **FBX** | Lo que suelen exportar Fusion 360 y 3ds Max |
| **OBJ** | Malla. Los materiales, si vienen, son limitados |
| **STL** | Solo geometría. Sirve para impresión |
| **3DS** | Malla antigua de 3ds Max |

No entran los nativos: `.f3d`, `.f3z`, `.max`, `.blend`, STEP ni IGES. Desde Fusion o 3ds Max hay que **exportar** a FBX o GLB. Desde Blender, GLB.

La unidad del visor es el **milímetro**.

- STL, OBJ y 3DS se leen como milímetros.
- FBX usa la unidad del archivo y se pasa a milímetros.
- GLB y glTF vienen en metros (así es el estándar) y se pasan a milímetros.

**Encuadre** solo acerca o aleja el objeto en la pantalla. No cambia la medida.

## Qué se puede exportar

Sale lo que está **visible**, en **milímetros**.

| Formato | Qué guarda |
|---|---|
| **GLB** | Modelo con materiales. Es el que conviene bajar |
| **glTF** | El mismo estándar, en JSON |
| **STL** | Solo la malla, para impresión |
| **OBJ** | Malla clásica, sin texturas |

No se exporta FBX: el navegador no lo puede escribir. Para llevarlo a otro programa, baja un GLB.

## El resto del estudio

- **Tintes:** grafito, polar, marfil, pizarra, tinta, metal, espejo y luz fría. **Original** devuelve el material del archivo.
- **Escenarios:** noche, galería, concreto, arena, océano, bosque, atardecer, hielo, o un color libre. Cambian fondo, piso y pared.
- **Luz:** estudio, galería, foco y alba. También intensidad, temperatura y ambiente.
- **Animación:** quieto, plato, oscilar, saltar.
- **Caras:** frente, atrás, izquierda, derecha, arriba, abajo.
- Si el archivo trae texturas UV o materiales, el panel los muestra y se pueden descargar.

## Arrancar en local

Node 22.

```bash
npm install --legacy-peer-deps
npm run dev
```

Vite abre el puerto 8080.

```bash
npm run build
npm run typecheck
```

El sitio público sale de GitHub (`main`) hacia Vercel.

## Dónde está el código

```
src/routes/index.tsx                 entrada
src/components/viewer/               estudio, captura, despiece, panel
src/lib/viewer-store.ts              estado
src/lib/shade.ts                     malla / sólido / material
src/lib/finishes.ts                  tintes
src/lib/scenes.ts                    escenarios
src/lib/model-files.ts               formatos que entran
src/lib/inspect.ts                   partes, UVs, materiales
```

React 19 · TanStack Start · Three.js · React Three Fiber · Zustand · Tailwind v4
