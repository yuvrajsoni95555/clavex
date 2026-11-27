# CLAVEX — fine jewellery website

A cinematic storefront built with Next.js (App Router), TypeScript and Tailwind, with real-time 3D jewellery (React Three Fiber) and slow, weighted motion (GSAP, Lenis, Framer Motion).

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all pages are prerendered)
npm start        # serve the production build
```

Deploy on Vercel as a standard Next.js project. Set `NEXT_PUBLIC_SITE_URL` to the live domain so share images get absolute URLs.

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
- **Performance** (Lighthouse, mobile, production build): Performance 90–94, Accessibility/Best practices/SEO 100, CLS 0, TBT under 100 ms. Simulated LCP is 3.1–3.7 s, above the 2.5 s target.

## Adding your own jewellery models

See [docs/MODELS.md](docs/MODELS.md). In short: export a `.glb` with the stone meshes named `gem`/`diamond`/`stone`, run it through `gltf-transform optimize`, put it in `public/models/`, and set `model: "/models/<file>.glb"` on the product in `src/data/products.ts`. Étoile Blanche already uses `public/models/sample-solitaire.glb` as a working example.
