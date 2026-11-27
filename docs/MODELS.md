# Adding your own jewellery models

The site draws a procedural solitaire until a product has its own model. To use yours:

1. Export the piece as **glTF binary (`.glb`)**.
2. Optimise it with **gltf-transform** (below).
3. Put the file in `public/models/`, e.g. `public/models/aurelia.glb`.
4. In `src/data/products.ts`, add `model: "/models/aurelia.glb"` to that product.

The product page's 3D viewer then loads your file. The metal and stone switchers still work, because the site paints its own materials onto your meshes.

## Rules for the export

| Rule | Why |
|---|---|
| **Name every stone mesh** with `gem`, `diamond` or `stone` in the name (`gem_center`, `Diamond.001`, `side_stone_3`…). Everything else is treated as metal. | Stones get the refraction material, metal gets the metal presets. |
| **Y is up.** For a ring: band standing upright, stone on top (+Y), front of the ring facing the viewer (+Z). | The camera poses are built around that orientation. |
| **Any unit is fine** (mm, cm, m). | The viewer scales every model to the same size as the built-in ring. |
| **Materials and textures are ignored.** | Metal and stone looks come from `src/config/materials.ts`, so you can drop textures from the export. |
| **Apply transforms and modifiers** before exporting (bevels, subdivision, arrays of pavé stones). | What you see in the modelling tool is what ships. |
| **Stones need closed, clean geometry.** Hard edges/flat facets look best: don't smooth-shade a diamond. | The refraction is ray-traced through the mesh, so holes or flipped normals show up as dark patches. |

### Blender

`File → Export → glTF 2.0`: Format **glTF Binary (.glb)**; Include → **Selected Objects**; Transform → **+Y Up** (on); Geometry → **Apply Modifiers** (on), Normals (on), UVs and Tangents (off); Materials → **No export** (optional); Compression off (gltf-transform does it next).

### MatrixGold / RhinoGold / Rhino

Rhino 7+ exports `.glb` directly: `File → Export Selected → glTF Binary (.glb)`. Before exporting:
- Mesh the NURBS at good density (`Mesh` command or the export's mesh settings). Rings look best around 50k–200k triangles in total.
- Put the stones on a layer or give them object names containing `gem`/`diamond`/`stone`.
- Rhino is Z-up. Either turn on the exporter's **Y-up** option, or rotate the piece 90° so it stands upright, stone on top.

If your version can't write glTF, export **OBJ** or **FBX** and convert it in Blender as above.

## Optimise with gltf-transform

Needs Node.js. Run in the project folder:

```bash
npx @gltf-transform/cli optimize input.glb public/models/aurelia.glb \
  --compress meshopt --texture-compress false --simplify false --join false
```

- `--compress meshopt` shrinks geometry about 5–7×. The viewer decodes Meshopt locally, with no extra download. Draco also works (`--compress draco`), but its decoder is fetched from Google's CDN at runtime.
- `--simplify false` keeps every facet and claw exactly as modelled.
- `--join false` keeps the stones and metal as separate meshes, so their names (and materials) survive.
- `--texture-compress false`: textures aren't used. If you ever keep them, `--texture-compress webp` is the simplest; KTX2 needs the `toktx` tool installed and an extra loader in the viewer.

Repeated parts (claws, pavé stones) become GPU instances automatically; the viewer handles that.

Check the result:

```bash
npx @gltf-transform/cli inspect public/models/aurelia.glb
```

**Target: under ~2 MB per model** (under 1 MB is better on phones). The sample in this repo went from 465 KB to 72 KB.

## Using a model elsewhere

- **Product page:** the `model` field above.
- **Hero and scroll story:** they use the procedural ring, because the story's "stone lifts off" effect needs the stone as a separate, movable part. To use your model there, pass `src="/models/…"` to `<JewelleryModel>` in `src/components/three/HeroScene.tsx` / `StoryScene.tsx`. The lift-off chapter won't move the stone of an imported model.
