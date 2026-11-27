"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Scene3D } from "./Scene3D";
import { JewelleryModel, GEM_Y } from "./JewelleryModel";
import { heroState } from "./heroState";
import { GemGlow, SweepLight } from "./Effects";

type Props = { active: boolean; lite: boolean; reduced: boolean; onReady: () => void };

const damp = THREE.MathUtils.damp;

/** Full-screen hero: a solitaire floating in a dark studio. Loaded lazily, never on the server. */
export default function HeroScene({ active, lite, reduced, onReady }: Props) {
  return (
    <Scene3D
      active={active}
      onDemand={reduced}
      camera={{ position: [0, 0.6, 9.6], fov: 30 }}
      onCreated={() => onReady()}
    >
      <Rig />
      <FloatingRing lite={lite} />
      <SweepLight />
      {/* slow gold dust drifting through the whole frame */}
      {!lite && <Sparkles count={40} scale={[9, 5, 4]} size={1.6} speed={0.15} opacity={0.5} color="#C9A96E" />}
    </Scene3D>
  );
}

/** Camera: eases in on load, then orbits and closes in as the hero scrolls away. */
function Rig() {
  const look = useRef(new THREE.Vector3());
  useFrame(({ camera, size }, delta) => {
    const p = heroState.reduced ? 0 : heroState.progress;
    const angle = p * Math.PI * 0.6;
    // portrait screens: step back and drop the ring below the headline
    const portrait = size.width / size.height < 0.8;
    const dist = (portrait ? 11.5 : 8.2) - p * 3 + (1 - heroState.intro) * 1.4;
    const k = 4;
    camera.position.x = damp(camera.position.x, Math.sin(angle) * dist, k, delta);
    camera.position.z = damp(camera.position.z, Math.cos(angle) * dist, k, delta);
    camera.position.y = damp(camera.position.y, 0.6 + p * 0.9, k, delta);
    look.current.set(0, (portrait ? 0.75 : 0.15) + p * (GEM_Y - 0.6), 0);
    camera.lookAt(look.current);
  });
  return null;
}

/** Slow spin + gentle float; the whole piece leans toward the cursor (or phone tilt). */
function FloatingRing({ lite }: { lite: boolean }) {
  const lean = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!lean.current || !spin.current) return;
    const { pointer, intro, reduced } = heroState;
    if (!reduced) spin.current.rotation.y += delta * 0.22;
    lean.current.rotation.x = damp(lean.current.rotation.x, 0.12 - pointer.y * 0.18, 2.5, delta);
    lean.current.rotation.z = damp(lean.current.rotation.z, -pointer.x * 0.12, 2.5, delta);
    lean.current.position.y = -0.35 + (reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.7) * 0.05);
    lean.current.scale.setScalar(0.88 + intro * 0.12);
  });

  return (
    <group ref={lean}>
      <group ref={spin}>
        <JewelleryModel metal="yellow" stone="diamond" lite={lite} />
        {/* tiny white glints around the stone */}
        <Sparkles
          count={lite ? 14 : 28}
          position={[0, GEM_Y - 0.1, 0]}
          scale={[1.1, 0.7, 1.1]}
          size={lite ? 2.5 : 3.5}
          speed={0.35}
          opacity={0.9}
          color="#FFF6E0"
        />
      </group>
      <GemGlow />
    </group>
  );
}
