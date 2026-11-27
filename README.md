# CLAVEX — fine jewellery website

A cinematic storefront built with Next.js (App Router), TypeScript and Tailwind, with real-time 3D jewellery (React Three Fiber) and slow, weighted motion (GSAP, Lenis, Framer Motion).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in /out (every page is plain HTML)
npx serve out    # preview the built site locally
npm run deploy   # build for GitHub Pages and publish it (see below)
```

## Live site

**https://yuvrajsoni95555.github.io/clavex/** (GitHub Pages)

`npm run deploy` (`scripts/deploy-pages.mjs`) builds the site and pushes the result to the `gh-pages` branch, which GitHub Pages serves; it is live about a minute later. Pushing to `main` alone does not update the live site. The site is a static export (`output: "export"` in `next.config.ts`), so it needs no server. Because GitHub serves it under `/clavex`, the deploy script sets `NEXT_PUBLIC_BASE_PATH=/clavex`; files from `public/` used in `next/image` or the 3D loader go through `asset()` in `src/lib/asset.ts` to get that prefix.

**Custom domain** (e.g. `clavex.com`): repo → Settings → Pages → Custom domain, point the domain's DNS at GitHub, then in `scripts/deploy-pages.mjs` set `BASE_PATH` to `""` and `SITE_URL` to the new domain (origin only, e.g. `https://clavex.com`).

## Where to change things

| What | File |
|---|---|
| Colours | `src/config/theme.ts` |
| Fonts | `src/app/layout.tsx` (Cormorant Garamond 300 + Manrope) |
| Motion feel: durations, easing, smooth-scroll weight, cursor, magnetic pull, preloader timing | `src/config/motion.ts` |
| Metal and stone looks (colour, roughness, refraction) | `src/config/materials.ts` |
| Products, prices, descriptions, 3D model per product | `src/data/products.ts` |
| Product photos | `public/products/<slug>.webp` and `<slug>-detail.webp` |
| The four "craft" chapters: copy and camera poses | `src/config/story.ts` |
| Contact email (placeholder `hello@clavex.example`) | `src/components/layout/Footer.tsx`, `src/components/sections/ProductExperience.tsx` |
| Homepage numbers (placeholders) | `src/app/page.tsx` |

Copy, prices, figures and product photos are placeholders. The photos are renders of the procedural ring; replace them with real photography under the same file names.

## How it is built

```
src/
  app/                    pages: home, /collections, /products/[slug], 404
  config/                 theme, motion, materials, story  ← tune the site here
  data/products.ts        the catalogue
  components/
    three/                Scene3D, JewelleryModel, MetalMaterial, DiamondMaterial,
                          StudioEnvironment, HeroScene, StoryScene, ProductViewer, Effects
    motion/               Preloader, SmoothScroll, CustomCursor, MagneticButton, RevealText,
                          RevealImage, Marquee, Counter, GoldDust, PageTransition, TransitionLink
    sections/             Hero, ScrollStory, CollectionGrid, ProductExperience
    layout/               Header, Footer
    ui/                   ProductCard
  lib/                    device checks, preloader hand-off
public/
  products/               product photos
  models/                 your .glb files (sample-solitaire.glb is an example)
```

- **3D is progressive enhancement.** Every page is server-rendered HTML with real text and photos. three.js loads afterwards, only in the browser. On phones it waits for the visitor's first touch or scroll; on the product page there is a "View in 3D" button. Without WebGL the photos stay.
- **Lighting** comes from a procedural studio of glowing panels (`StudioEnvironment`), so there is no HDR file to download.
- **Diamonds** use drei's `MeshRefractionMaterial` (ray-traced refraction with chromatic aberration). `DiamondMaterial.tsx` carries a one-line shim for three r187; remove it once drei ships a fix.
- **Reduced motion:** smooth scroll, auto-rotation, parallax, tilt, magnetic pull, gold dust and text reveals all switch off; the 3D renders only on demand.
- **Performance** (Lighthouse, mobile, measured on a server build before the move to static hosting): Performance 90–94, Accessibility/Best practices/SEO 100, CLS 0, TBT under 100 ms. Simulated LCP was 3.1–3.7 s, above the 2.5 s target.
- **Static-host trade-offs:** images are served as the original .webp files (no resizing server), link prefetching is off, and a wrong URL shows the 404 page with a real 404 status.

## Adding your own jewellery models

See [docs/MODELS.md](docs/MODELS.md). In short: export a `.glb` with the stone meshes named `gem`/`diamond`/`stone`, run it through `gltf-transform optimize`, put it in `public/models/`, and set `model: "/models/<file>.glb"` on the product in `src/data/products.ts`. Étoile Blanche already uses `public/models/sample-solitaire.glb` as a working example.
