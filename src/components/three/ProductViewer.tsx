"use client";
import { Suspense, useEffect, useRef, type RefObject } from "react";
import { useThree } from "@react-three/fiber";
import { Bounds, ContactShadows, OrbitControls } from "@react-three/drei";
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

// distance limits in ring units (every model is scaled to ~2.65 tall): close enough for the claws, never inside the band
const MIN_DIST = 3.2;
const MAX_DIST = 14;
// the opening view: three-quarters from the front and a little above, like a product photograph
const START = new THREE.Vector3(Math.sin(0.6) * Math.cos(0.38), Math.sin(0.38), Math.cos(0.6) * Math.cos(0.38)).multiplyScalar(9);
const IDLE_MS = 2500; // auto-rotate resumes this long after the visitor lets go

export default function ProductViewer({ metal, stone, model, lite, reduced, touch, apiRef, onReady }: Props) {
  return (
    <Scene3D onDemand={reduced} camera={{ position: START.toArray(), fov: 30 }} onCreated={() => onReady()}>
      <Controls reduced={reduced} touch={touch} apiRef={apiRef} />
      <SweepLight />
      {/* soft key from above-front, so the band reads as rounded and the claws catch light */}
      <directionalLight position={[2, 4, 3]} intensity={1.2} color="#fff6ea" />
      <Suspense fallback={null}>
        {/* fits the whole ring in frame with padding for any screen shape, and again on resize */}
        <Bounds fit clip observe margin={1.08} maxDuration={0}>
          <JewelleryModel src={model} metal={metal} stone={stone ?? "diamond"} setting={!!stone} lite={lite} />
          {stone && !model && <GemGlow /> /* glow is placed for the procedural stone */}
        </Bounds>
      </Suspense>
      {/* the camera orbits, the ring stays still: the shadow keeps re-rendering only so a late-loading .glb gets one too */}
      {!lite && <ContactShadows position={[0, -1.16, 0]} opacity={0.6} scale={4.5} blur={2.4} far={1.4} resolution={512} color="#000" />}
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
      makeDefault
      enablePan={false}
      enableZoom={touch}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.6}
      minDistance={MIN_DIST}
      maxDistance={MAX_DIST}
      minPolarAngle={0.3}
      maxPolarAngle={Math.PI / 2 + 0.12} // a touch below the horizon at most: never under the ring
      autoRotate={!reduced}
      autoRotateSpeed={0.8}
      onStart={pause}
      onEnd={resumeLater}
    />
  );
}
