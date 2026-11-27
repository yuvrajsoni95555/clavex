"use client";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { METALS, type MetalKey } from "@/config/materials";
import { useStudio } from "./StudioEnvironment";

export { METALS, type MetalKey };

/**
 * Polished metal. Changing `metal` glides to the new colour instead of snapping.
 * `bright`: reflect the light tent the stones use, so white-gold claws read silver-bright, not black.
 */
export function MetalMaterial({
  metal = "yellow",
  bright = false,
  satin = false,
  attach,
}: {
  metal?: MetalKey;
  bright?: boolean;
  /** softer finish, for surfaces that would otherwise act as a concave mirror */
  satin?: boolean;
  attach?: string;
}) {
  const studio = useStudio();
  const ref = useRef<THREE.MeshPhysicalMaterial>(null);
  const target = useMemo(() => new THREE.Color(METALS[metal].color), [metal]);
  const finish = (m: MetalKey) => (satin ? Math.max(METALS[m].roughness, 0.36) : METALS[m].roughness);
  const [initial] = useState(() => ({ color: METALS[metal].color, roughness: finish(metal) })); // later changes glide in useFrame

  useFrame((state, delta) => {
    const m = ref.current;
    if (!m) return;
    const k = 1 - Math.exp(-5 * delta);
    m.color.lerp(target, k);
    m.roughness = THREE.MathUtils.lerp(m.roughness, finish(metal), k);
    // with frameloop="demand" (reduced motion) keep asking for frames until the change settles
    if (Math.abs(m.color.r - target.r) + Math.abs(m.color.g - target.g) + Math.abs(m.color.b - target.b) > 0.002) {
      state.invalidate();
    }
  });

  return (
    <meshPhysicalMaterial
      ref={ref}
      attach={attach}
      color={initial.color}
      roughness={initial.roughness}
      metalness={1}
      clearcoat={0.2}
      clearcoatRoughness={0.1}
      envMap={bright ? studio?.gemEnv : null}
      envMapIntensity={bright ? 1 : 1.4}
    />
  );
}
