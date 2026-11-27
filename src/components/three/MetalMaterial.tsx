"use client";
import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { METALS, type MetalKey } from "@/config/materials";

export { METALS, type MetalKey };

/** Polished metal. Changing `metal` glides to the new colour instead of snapping. */
export function MetalMaterial({ metal = "yellow" }: { metal?: MetalKey }) {
  const ref = useRef<THREE.MeshPhysicalMaterial>(null);
  const target = useMemo(() => new THREE.Color(METALS[metal].color), [metal]);
  const [initial] = useState(() => METALS[metal]); // later changes glide in useFrame

  useFrame((state, delta) => {
    const m = ref.current;
    if (!m) return;
    const k = 1 - Math.exp(-5 * delta);
    m.color.lerp(target, k);
    m.roughness = THREE.MathUtils.lerp(m.roughness, METALS[metal].roughness, k);
    // with frameloop="demand" (reduced motion) keep asking for frames until the change settles
    if (Math.abs(m.color.r - target.r) + Math.abs(m.color.g - target.g) + Math.abs(m.color.b - target.b) > 0.002) {
      state.invalidate();
    }
  });

  return (
    <meshPhysicalMaterial
      ref={ref}
      color={initial.color}
      roughness={initial.roughness}
      metalness={1}
      clearcoat={0.2}
      clearcoatRoughness={0.1}
      envMapIntensity={1.4}
    />
  );
}
