"use client";
import { MeshRefractionMaterial } from "@react-three/drei";
import { ShaderChunk } from "three";
import { useStudioCube } from "./StudioEnvironment";
import { STONES, type StoneKey } from "@/config/materials";

// shortcut: three r187 dropped this chunk but drei 10.7's refraction shader still #includes it.
// It only matters for PMREM env maps; we pass a plain cube map, so an empty chunk is safe. Remove once drei catches up.
(ShaderChunk as Record<string, string>).cube_uv_reflection_fragment ??= "";

export { STONES, type StoneKey };

/**
 * Ray-traced refraction with chromatic aberration (the rainbow "fire").
 * Needs <StudioEnvironment> above it. `lite` halves the bounces for phones.
 */
export function DiamondMaterial({ stone = "diamond", lite = false }: { stone?: StoneKey; lite?: boolean }) {
  const cube = useStudioCube();
  if (!cube) return null;
  const s = STONES[stone];
  return (
    <MeshRefractionMaterial
      envMap={cube}
      bounces={lite ? 2 : 3}
      ior={s.ior}
      fresnel={1}
      aberrationStrength={s.aberration}
      color={s.color}
      fastChroma
      toneMapped={false}
    />
  );
}
