"use client";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TABLE_Y as GEM_Y, GIRDLE_Y, STONE_R } from "./ringGeometry";
import { brilliantCut } from "./gemGeometry";
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

/** A four-point star, drawn once: soft core, two long thin rays, two short faint diagonals. */
function starTexture() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const m = size / 2;
  g.globalCompositeOperation = "lighter";
  const core = g.createRadialGradient(m, m, 0, m, m, m * 0.22);
  core.addColorStop(0, "rgba(255,255,255,1)");
  core.addColorStop(1, "rgba(255,250,240,0)");
  g.fillStyle = core;
  g.fillRect(0, 0, size, size);
  const ray = (angle: number, length: number, alpha: number) => {
    g.save();
    g.translate(m, m);
    g.rotate(angle);
    const grad = g.createLinearGradient(-length, 0, length, 0);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(-length, -1.5, length * 2, 3);
    g.restore();
  };
  ray(0, m, 1);
  ray(Math.PI / 2, m, 1);
  ray(Math.PI / 4, m * 0.35, 0.45);
  ray(-Math.PI / 4, m * 0.35, 0.45);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const KEY_LIGHT = new THREE.Vector3(3, 4, 4).normalize(); // the gem studio's key panel
const SIZE = 0.26;

/**
 * Star glints, like jewellery photography: each sits on a crown facet and flares only when that facet
 * mirrors the key light into the camera, so they come and go as the ring turns. Put it in the stone's group.
 */
export function GemGlints() {
  const map = useMemo(() => starTexture(), []);
  // crown facets (bezel, star, upper girdle), skipping the table: their centres and outward normals, in ring units
  const spots = useMemo(() => {
    const { geometry } = brilliantCut();
    const p = geometry.attributes.position;
    const n = geometry.attributes.normal;
    const out: { pos: THREE.Vector3; normal: THREE.Vector3 }[] = [];
    for (let i = 0; i < p.count; i += 3) {
      const normal = new THREE.Vector3().fromBufferAttribute(n, i);
      if (normal.y < 0.3 || normal.y > 0.99) continue;
      const centre = new THREE.Vector3()
        .fromBufferAttribute(p, i)
        .add(new THREE.Vector3().fromBufferAttribute(p, i + 1))
        .add(new THREE.Vector3().fromBufferAttribute(p, i + 2))
        .divideScalar(3);
      out.push({ pos: centre.multiplyScalar(STONE_R).add(new THREE.Vector3(0, GIRDLE_Y, 0)), normal });
    }
    return out.filter((_, i) => i % 3 === 0); // a dozen is plenty; more reads as glitter
  }, []);

  const refs = useRef<(THREE.Sprite | null)[]>([]);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const n = useMemo(() => new THREE.Vector3(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const w = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, clock }) => {
    refs.current.forEach((s, i) => {
      if (!s) return;
      s.parent!.getWorldQuaternion(q);
      n.copy(spots[i].normal).applyQuaternion(q);
      s.getWorldPosition(w);
      v.copy(camera.position).sub(w).normalize();
      // mirror the key light off the facet; how close does it land to the eye?
      const reflected = n.clone().multiplyScalar(2 * n.dot(KEY_LIGHT)).sub(KEY_LIGHT);
      const hit = Math.pow(Math.max(0, reflected.dot(v)), 48);
      const twinkle = heroState.reduced ? 1 : 0.85 + 0.15 * Math.sin(clock.elapsedTime * 7 + i * 1.7);
      s.scale.setScalar(SIZE * hit * twinkle + 1e-4);
      s.material.rotation = 0.2 + i * 0.05;
    });
  });

  return spots.map((spot, i) => (
    <sprite key={i} ref={(el) => void (refs.current[i] = el)} position={spot.pos.clone().addScaledVector(spot.normal, 0.004)}>
      <spriteMaterial map={map} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </sprite>
  ));
}
