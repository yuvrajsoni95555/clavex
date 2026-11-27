"use client";
import { Suspense, useEffect, useRef, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import type { MetalKey, StoneKey } from "@/config/materials";
import { Scene3D } from "./Scene3D";
import { JewelleryModel } from "./JewelleryModel";
import { GemGlow, SweepLight } from "./Effects";

/** What the page's buttons and keyboard can ask the viewer to do. */
export type ViewerApi = {
  /** factor < 1 moves closer, > 1 moves away */
  zoom: (factor: number) => void;
  /** turn around the piece, radians */
  rotate: (radians: number) => void;
};

type Props = {
  metal: MetalKey;
  stone: StoneKey | null;
  model?: string;
  lite: boolean;
  reduced: boolean;
  /** pinch-zoom on touch screens; desktop zooms with ⌘/Ctrl + wheel or trackpad pinch, so plain scrolling still scrolls the page */
  touch: boolean;
  apiRef: RefObject<ViewerApi | null>;
  onReady: () => void;
};

const TARGET = new THREE.Vector3(0, 0.5, 0); // between band centre and stone, so zooming keeps both in frame
const MIN_DIST = 3.6;
const MAX_DIST = 9;
const IDLE_MS = 2500; // auto-rotate resumes this long after the visitor lets go

export default function ProductViewer({ metal, stone, model, lite, reduced, touch, apiRef, onReady }: Props) {
  return (
    <Scene3D lite={lite} onDemand={reduced} camera={{ position: [2.6, 1.6, 6.6], fov: 30 }} onCreated={() => onReady()}>
      <Controls reduced={reduced} touch={touch} apiRef={apiRef} />
      <SweepLight />
      <Suspense fallback={null}>
        <JewelleryModel src={model} metal={metal} stone={stone ?? "diamond"} setting={!!stone} lite={lite} />
      </Suspense>
      {stone && !model && <GemGlow /> /* glow is placed for the procedural stone */}
    </Scene3D>
  );
}

function Controls({ reduced, touch, apiRef }: Pick<Props, "reduced" | "touch" | "apiRef">) {
  const controls = useRef<OrbitControlsImpl>(null);
  const idle = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { camera, gl, invalidate } = useThree();

  const pause = () => {
    if (!controls.current) return;
    controls.current.autoRotate = false;
    clearTimeout(idle.current);
  };
  const resumeLater = () => {
    clearTimeout(idle.current);
    if (reduced) return;
    idle.current = setTimeout(() => controls.current && (controls.current.autoRotate = true), IDLE_MS);
  };

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const zoom = (factor: number) => {
      pause();
      const offset = camera.position.clone().sub(c.target);
      offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, MIN_DIST, MAX_DIST));
      camera.position.copy(c.target).add(offset);
      c.update();
      invalidate();
      resumeLater();
    };
    apiRef.current = {
      zoom,
      rotate: (radians) => {
        pause();
        c.setAzimuthalAngle(c.getAzimuthalAngle() + radians);
        c.update();
        invalidate();
        resumeLater();
      },
    };

    // desktop: ⌘/Ctrl + wheel (and trackpad pinch, which arrives as ctrl+wheel) zooms; plain wheel scrolls the page
    const onWheel = (e: WheelEvent) => {
      if (touch || !(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      zoom(1 + THREE.MathUtils.clamp(e.deltaY, -50, 50) * 0.004);
    };
    gl.domElement.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      gl.domElement.removeEventListener("wheel", onWheel);
      clearTimeout(idle.current);
      apiRef.current = null;
    };
    // pause/resumeLater only touch refs; listing them would rebind on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, invalidate, touch, apiRef]);

  return (
    <OrbitControls
      ref={controls}
      target={TARGET}
      enablePan={false}
      enableZoom={touch}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.6}
      minDistance={MIN_DIST}
      maxDistance={MAX_DIST}
      minPolarAngle={0.25}
      maxPolarAngle={Math.PI - 0.6}
      autoRotate={!reduced}
      autoRotateSpeed={0.8}
      onStart={pause}
      onEnd={resumeLater}
    />
  );
}
