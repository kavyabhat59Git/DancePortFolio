# Kavya Bhat · Dancer & Choreographer

Portfolio site, live at https://kavyabhat59git.github.io/DancePortFolio/

## What's in here

| Path | What it is |
|---|---|
| `index.html`, `assets/`, `media/`, `stickers/`, `favicon.svg` | The **built website**. GitHub Pages serves these files straight from `main`. |
| `source/` | The **editable project** (React + Vite) these files are built from. |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are. |

## Changing text

All the words on the site (story, journey, disciplines, highlights, contact details) live in one file:
`source/src/data.ts`. Edit it, then rebuild (below).

## Rebuilding after a change

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
cd source
npm install
npm run build
```

Then copy everything inside `source/dist/` to the top of the repo (replacing the old `index.html`, `assets/`, `media/`, `stickers/`), commit and push. The live site updates a minute or two later.

To preview locally while editing: `npm run dev` inside `source/`.

## Built with

React, three.js (React Three Fiber + drei + Rapier physics), OGL, GSAP + ScrollTrigger, anime.js, Motion (Framer Motion), Lenis, and components from React Bits. The 3D sticker illustrations were generated for this site.

The site adjusts itself to the device: phones and older laptops get lighter effects, and anyone who has "reduce motion" turned on gets a calm, still version.
