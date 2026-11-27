"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GEM_Y } from "./JewelleryModel";
import { heroState } from "./heroState";

// heroState.reduced doubles as the site-wide "less motion" flag for every scene.

/** A warm point light circling the ring, so highlights travel across the polished band. */
export function SweepLight() {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!light.current || heroState.reduced) return;
    const t = clock.elapsedTime * 0.45;
    light.current.position.set(Math.sin(t) * 4, 2.2, Math.cos(t) * 4);
  });
  return <pointLight ref={light} position={[3, 2.2, 3]} intensity={28} color="#FFE7C2" />;
}

/**
 * Soft halo around the stone. Stands in for a Bloom pass: postprocessing makes the canvas opaque,
 * which would hide the CLAVEX wordmark behind the ring, and a sprite costs almost nothing on phones.
 */
export function GemGlow({ position = [0, GEM_Y - 0.12, 0.05] }: { position?: [number, number, number] }) {
  const sprite = useRef<THREE.Sprite>(null);
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,246,224,0.9)");
    grad.addColorStop(0.25, "rgba(255,236,200,0.25)");
    grad.addColorStop(1, "rgba(255,236,200,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useFrame(({ clock }) => {
    if (!sprite.current || heroState.reduced) return;
    // breathes with the sweep light so the stone seems to catch it
    (sprite.current.material as THREE.SpriteMaterial).opacity = 0.35 + 0.2 * Math.sin(clock.elapsedTime * 0.9);
  });

  return (
    <sprite ref={sprite} position={position} scale={1.1}>
      <spriteMaterial map={map} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} opacity={0.45} />
    </sprite>
  );
}
