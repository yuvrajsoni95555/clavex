"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { story } from "@/config/story";
import { Scene3D } from "./Scene3D";
import { JewelleryModel } from "./JewelleryModel";
import { GemGlow, SweepLight } from "./Effects";
import { heroState, storyState } from "./heroState";

type Props = { active: boolean; lite: boolean; onReady: () => void };

const damp = THREE.MathUtils.damp;
const lerp = THREE.MathUtils.lerp;
const target = new THREE.Vector3();
const lookAt = new THREE.Vector3();

/**
 * Where we are between chapters. Each chapter holds still for the middle half of its scroll
 * (so the copy can be read); the camera only travels in the gaps between chapters.
 */
function sample(progress: number) {
  const s = THREE.MathUtils.clamp(progress, 0, 1) * (story.length - 1);
  const i = Math.min(Math.floor(s), story.length - 2);
  return { a: story[i], b: story[i + 1], t: THREE.MathUtils.smoothstep(s - i, 0.25, 0.75) };
}

/** Pinned craftsmanship story: the ring turns, the camera moves in, the stone lifts off and settles. */
export default function StoryScene({ active, lite, onReady }: Props) {
  return (
    <Scene3D active={active} lite={lite} camera={{ position: story[0].camera, fov: 30 }} onCreated={() => onReady()}>
      <StoryRig lite={lite} />
      <SweepLight />
    </Scene3D>
  );
}

function StoryRig({ lite }: { lite: boolean }) {
  const turn = useRef<THREE.Group>(null);
  const gem = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Group>(null);
  const look = useRef(new THREE.Vector3(...story[0].look));

  useFrame(({ camera, size }, delta) => {
    const { a, b, t } = sample(storyState.progress);
    const k = heroState.reduced ? 100 : 3; // reduced motion: jump to the pose instead of gliding
    const ease = (from: number, to: number) => damp(from, to, k, delta);

    // poses are framed for a wide screen beside the copy; on portrait, centre the piece,
    // step back so it fits the narrow frame, and lift it into the top half above the copy
    const portrait = size.width / size.height < 0.8;
    lookAt.set(lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t), lerp(a.look[2], b.look[2], t));
    target.set(lerp(a.camera[0], b.camera[0], t), lerp(a.camera[1], b.camera[1], t), lerp(a.camera[2], b.camera[2], t));
    if (portrait) {
      target.sub(lookAt).multiplyScalar(1.8).add(lookAt);
      lookAt.x = 0;
      lookAt.y -= 0.9;
    }
    camera.position.set(ease(camera.position.x, target.x), ease(camera.position.y, target.y), ease(camera.position.z, target.z));
    look.current.set(ease(look.current.x, lookAt.x), ease(look.current.y, lookAt.y), ease(look.current.z, lookAt.z));
    camera.lookAt(look.current);

    if (turn.current) turn.current.rotation.y = ease(turn.current.rotation.y, lerp(a.turn, b.turn, t));
    if (gem.current && glow.current) {
      gem.current.position.y = ease(gem.current.position.y, lerp(a.lift, b.lift, t));
      glow.current.position.y = gem.current.position.y;
      // while it floats, the stone turns on its own to show the pavilion; it settles back square
      if (!heroState.reduced) gem.current.rotation.y += delta * 1.2 * (gem.current.position.y / 0.75);
    }
  });

  return (
    <group ref={turn}>
      <JewelleryModel metal="yellow" stone="diamond" lite={lite} gemRef={gem} />
      <group ref={glow}>
        <GemGlow />
      </group>
    </group>
  );
}
