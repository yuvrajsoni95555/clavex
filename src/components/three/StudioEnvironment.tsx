"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

type Studio = {
  /** bright cube map the centre stone refracts (MeshRefractionMaterial needs a plain cube) */
  gemCube: THREE.CubeTexture;
  /** the same bright studio, prefiltered, for the small stones and the low-power fallback */
  gemEnv: THREE.Texture;
};
const StudioContext = createContext<Studio | null>(null);
export const useStudio = () => useContext(StudioContext);

type Panel = { size: [number, number]; at: [number, number, number]; power: number; tint?: [number, number, number] };

// Metal: a dark photo studio built from glowing panels, like the softboxes a jeweller shoots with.
// Values above 1 are HDR: they make the long, sharp highlights on polished metal.
const METAL_STUDIO: Panel[] = [
  { size: [1.4, 9], at: [-1.6, 8, 0], power: 2.6 }, // overhead pair: long clean lines, not a square blob
  { size: [1.4, 9], at: [1.6, 8, 0], power: 2.6 },
  { size: [1.2, 8], at: [-6, 1, 0], power: 5 }, // left strip: long highlight down the band
  { size: [1.2, 8], at: [6, 1, 0], power: 5 }, // right strip
  { size: [0.6, 6], at: [4, 2, 5], power: 7 }, // front-right kicker
  { size: [8, 2], at: [0, 1, -7], power: 1.6, tint: [1, 0.82, 0.6] }, // warm back panel
  { size: [3, 0.6], at: [0, -2, 6], power: 3 }, // low front fill
];

// Stone: a bright light tent. A diamond only looks white if it has light to bend; it shows black wherever it
// "sees" darkness. Alternating bright panels and black flags around it give the crisp light/dark facet pattern.
function gemStudio() {
  // overhead: bright strips with dark gaps, so the crown shows contrast instead of one milky reflection
  const panels: Panel[] = [-3, -1, 1, 3].map((x) => ({ size: [0.8, 10] as [number, number], at: [x, 7, 0] as [number, number, number], power: 4.2 }));
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    panels.push({ size: [1.6, 7], at: [Math.cos(a) * 6, 0.5, Math.sin(a) * 6], power: i % 2 ? 0.05 : 3.2 }); // flags: near-black, not void
  }
  panels.push({ size: [2, 2], at: [3, 4, 4], power: 14, tint: [1, 0.97, 0.92] }); // key light: the brightest sparks
  panels.push({ size: [1.2, 1.2], at: [-4, 3, 3], power: 10 }); // second, smaller source: more scintillation as it turns
  panels.push({ size: [12, 12], at: [0, -5, 0], power: 0.15 }); // dim floor
  return { panels, background: new THREE.Color(0.2, 0.2, 0.21) }; // dark grey: the panels carry the light, the gaps give contrast
}

/** `blur` softens the prefiltered map, so concave surfaces (inside of the band) show smooth gradients, not hard panel edges */
function renderStudio(gl: THREE.WebGLRenderer, panels: Panel[], background: THREE.Color, blur: number) {
  const studio = new THREE.Scene();
  studio.background = background;
  for (const b of panels) {
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
  const env = pmrem.fromScene(studio, blur).texture;
  pmrem.dispose();
  studio.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      o.material.dispose();
    }
  });
  return { target, env };
}

export function StudioEnvironment({ children }: { children: ReactNode }) {
  const gl = useThree((s) => s.gl);
  const get = useThree((s) => s.get);
  const [studio, setStudio] = useState<Studio | null>(null);

  // built in an effect (not useMemo) so StrictMode's double run can't reuse disposed GPU textures
  useEffect(() => {
    const metal = renderStudio(gl, METAL_STUDIO, new THREE.Color(0.012, 0.011, 0.01), 0.035);
    const g = gemStudio();
    const gem = renderStudio(gl, g.panels, g.background, 0.015);

    const scene = get().scene;
    scene.environment = metal.env;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- GPU textures made here must live and die with this effect
    setStudio({ gemCube: gem.target.texture, gemEnv: gem.env });
    return () => {
      scene.environment = null;
      for (const s of [metal, gem]) {
        s.env.dispose();
        s.target.dispose();
      }
    };
  }, [gl, get]);

  if (!studio) return null;
  return <StudioContext.Provider value={studio}>{children}</StudioContext.Provider>;
}
