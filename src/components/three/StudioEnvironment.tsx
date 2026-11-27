"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

/** Cube map of the studio, used by DiamondMaterial for refraction. */
const StudioCubeContext = createContext<THREE.CubeTexture | null>(null);
export const useStudioCube = () => useContext(StudioCubeContext);

type Softbox = { size: [number, number]; at: [number, number, number]; power: number; tint?: [number, number, number] };

// A dark photo studio built from glowing panels, like the softboxes a jeweller shoots with.
// Procedural, so there is no .hdr file to download. Values above 1 are HDR: they make the sharp highlights on metal.
const SOFTBOXES: Softbox[] = [
  { size: [6, 6], at: [0, 8, 0], power: 2.5 }, // overhead
  { size: [1.2, 8], at: [-6, 1, 0], power: 5 }, // left strip: long highlight down the band
  { size: [1.2, 8], at: [6, 1, 0], power: 5 }, // right strip
  { size: [0.6, 6], at: [4, 2, 5], power: 7 }, // front-right kicker: diamond fire
  { size: [8, 2], at: [0, 1, -7], power: 1.6, tint: [1, 0.82, 0.6] }, // warm back panel
  { size: [3, 0.6], at: [0, -2, 6], power: 3 }, // low front fill
];

export function StudioEnvironment({ children }: { children: ReactNode }) {
  const gl = useThree((s) => s.gl);
  const get = useThree((s) => s.get);
  const [cube, setCube] = useState<THREE.CubeTexture | null>(null);

  // built in an effect (not useMemo) so StrictMode's double run can't reuse disposed GPU textures
  useEffect(() => {
    const studio = new THREE.Scene();
    studio.background = new THREE.Color(0.012, 0.011, 0.01);
    for (const b of SOFTBOXES) {
      const [r, g, bl] = b.tint ?? [1, 1, 1];
      const panel = new THREE.Mesh(
        new THREE.PlaneGeometry(...b.size),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(r * b.power, g * b.power, bl * b.power), side: THREE.DoubleSide }),
      );
      panel.position.set(...b.at);
      panel.lookAt(0, 0, 0);
      studio.add(panel);
    }

    const target = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
    new THREE.CubeCamera(0.1, 50, target).update(gl, studio);
    const pmrem = new THREE.PMREMGenerator(gl);
    const envMap = pmrem.fromCubemap(target.texture).texture;
    pmrem.dispose();
    studio.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        o.material.dispose();
      }
    });

    const scene = get().scene;
    scene.environment = envMap;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- GPU texture made here must live and die with this effect
    setCube(target.texture);
    return () => {
      scene.environment = null;
      envMap.dispose();
      target.dispose();
    };
  }, [gl, get]);

  if (!cube) return null;
  return <StudioCubeContext.Provider value={cube}>{children}</StudioCubeContext.Provider>;
}
