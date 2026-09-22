# cositadelocos

Visor 3D personal: órbita, malla / sólido / material, animaciones, cubo de caras, partes, texturas UV y captura.

No es un solo `index.html`. La entrada de la app es `src/routes/index.tsx`.

## Correrlo

Necesitas Node 22.

```bash
npm install --legacy-peer-deps
npm run dev
```

Luego abre la URL que imprima Vite.

## Subirlo a GitHub

```bash
git init
git add .
git commit -m "cositadelocos visor 3D"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/cositadelocos.git
git push -u origin main
```

## Publicar

```bash
npm run build
```

Despliégalo en Vercel (o un host compatible con Vite).

## Usar

- Arrastra un **GLB / glTF / OBJ / STL** al estudio
- Vista: malla, sólido, material
- Animación: plato, oscilar, saltar
- Cubo de caras abajo a la derecha
- Partes, texturas UV y materiales (si el modelo los trae)

Los archivos que cargas viven solo en el navegador. No se suben al servidor.
