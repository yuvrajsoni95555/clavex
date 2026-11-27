"use client";
import { MeshRefractionMaterial } from "@react-three/drei";
import { ShaderChunk } from "three";
import { useStudio } from "./StudioEnvironment";
import { useLowQuality } from "./Scene3D";
import { STONES, type StoneKey } from "@/config/materials";

// shortcut: three r187 dropped this chunk but drei 10.7's refraction shader still #includes it.
// It only matters for PMREM env maps; we pass a plain cube map, so an empty chunk is safe. Remove once drei catches up.
(ShaderChunk as Record<string, string>).cube_uv_reflection_fragment ??= "";

export { STONES, type StoneKey };

/**
 * The centre stone: ray-traced refraction through the real facets, lit by the bright gem studio,
 * with a little chromatic aberration for fire. Falls back to StoneSparkleMaterial on GPUs that can't keep up.
 */
export function DiamondMaterial({ stone = "diamond", lite = false }: { stone?: StoneKey; lite?: boolean }) {
  const studio = useStudio();
  const low = useLowQuality();
  if (!studio) return null;
  if (low) return <StoneSparkleMaterial stone={stone} />;
  const s = STONES[stone];
  return (
    <MeshRefractionMaterial
      envMap={studio.gemCube}
      bounces={lite ? 3 : 4}
      ior={s.ior}
      fresnel={1}
      aberrationStrength={s.aberration}
      color={s.color}
      fastChroma
    />
  );
}

/**
 * Cheap faceted stone: no refraction, every facet a mirror of the gem studio (bright strips, dark gaps), so it
 * reads as a crisp light/dark mosaic like a real diamond, never a flat white blob. Pure reflection (metalness 1)
 * means scene lights add no diffuse wash. A thin iridescent film gives a hint of fire.
 * Used for the small accent stones and as the centre stone's low-power fallback.
 */
export function StoneSparkleMaterial({ stone = "diamond" }: { stone?: StoneKey }) {
  const studio = useStudio();
  if (!studio) return null;
  return (
    <meshPhysicalMaterial
      color={STONES[stone].color}
      envMap={studio.gemEnv}
      envMapIntensity={2.4}
      metalness={1}
      roughness={0.03}
      iridescence={0.35}
      iridescenceIOR={2.42}
      flatShading
    />
  );
}
