"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, type Ref } from "react";
import { Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { asset } from "@/lib/asset";
import { MetalMaterial, type MetalKey } from "./MetalMaterial";
import { DiamondMaterial, StoneSparkleMaterial, type StoneKey } from "./DiamondMaterial";
import { GemGlints } from "./Effects";
import { brilliantCut } from "./gemGeometry";
import {
  bandGeometry,
  GIRDLE_Y,
  HALO_SEAT,
  haloMatrices,
  headGeometry,
  paveMatrices,
  settingClearance,
  STONE_R,
  TABLE_Y,
} from "./ringGeometry";
import { RING } from "@/config/materials";

type Props = {
  metal?: MetalKey;
  stone?: StoneKey;
  /** a .glb under /public/models/, e.g. "/models/solitaire.glb". Without it a procedural solitaire is drawn. */
  src?: string;
  lite?: boolean;
  /** procedural model only: the stone's group, so a scene can lift it off the setting (exploded view) */
  gemRef?: Ref<THREE.Group>;
  /** procedural model only: false draws a plain wedding band with no stone */
  setting?: boolean;
};

/** Height of the procedural stone's table above the ring centre; the hero and the story aim at it. */
export const GEM_Y = TABLE_Y;
/** largest dimension of the procedural ring (its height); imported models are scaled to match */
const FIT_SIZE = 2.65;

export function JewelleryModel({ src, ...rest }: Props) {
  return src ? <GltfJewellery src={src} {...rest} /> : <ProceduralSolitaire {...rest} />;
}

/* ---------- your own models ---------- */

// Mesh names decide the material: anything called gem/diamond/stone gets DiamondMaterial, the rest is metal.
const GEM_NAME = /gem|diamond|stone/i;

// gemRef is ignored here: a .glb stone is baked into the file's transforms
function GltfJewellery({ src, metal, stone, lite }: Props & { src: string }) {
  const { scene } = useGLTF(asset(src)); // Draco and Meshopt compressed files both load
  const { meshes, fit } = useMemo(() => {
    scene.updateMatrixWorld(true);
    const list: { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4; gem: boolean; key: string }[] = [];
    const box = new THREE.Box3();
    const add = (o: THREE.Mesh, matrix: THREE.Matrix4, key: string) => {
      list.push({ geometry: o.geometry, matrix, gem: GEM_NAME.test(o.name), key });
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      box.union(o.geometry.boundingBox!.clone().applyMatrix4(matrix));
    };
    scene.traverse((o) => {
      if (o instanceof THREE.InstancedMesh) {
        // gltf-transform turns repeated parts (claws, pavé) into GPU instances; draw each copy
        const m = new THREE.Matrix4();
        for (let i = 0; i < o.count; i++) {
          o.getMatrixAt(i, m);
          add(o, o.matrixWorld.clone().multiply(m), `${o.uuid}-${i}`);
        }
      } else if (o instanceof THREE.Mesh) add(o, o.matrixWorld.clone(), o.uuid);
    });
    // any export unit (mm, cm, m) ends up the same size as the procedural ring, so every camera pose still fits
    const size = box.getSize(new THREE.Vector3());
    return { meshes: list, fit: FIT_SIZE / Math.max(size.x, size.y, size.z) };
  }, [scene]);

  return (
    // the procedural ring's bounding box is centred slightly above the band centre; match it
    <group position={[0, 0.24, 0]} scale={fit}>
      <Center>
        {meshes.map((m) => (
          <mesh key={m.key} geometry={m.geometry} matrix={m.matrix} matrixAutoUpdate={false}>
            {m.gem ? <DiamondMaterial stone={stone} lite={lite} /> : <MetalMaterial metal={metal} />}
          </mesh>
        ))}
      </Center>
    </group>
  );
}

/* ---------- procedural engagement ring ---------- */

function AccentStones({ matrices }: { matrices: THREE.Matrix4[] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => brilliantCut().geometry, []);
  useLayoutEffect(() => {
    matrices.forEach((m, i) => ref.current!.setMatrixAt(i, m));
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [matrices]);
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, matrices.length]}>
      <StoneSparkleMaterial />
    </instancedMesh>
  );
}

function ProceduralSolitaire({ metal = "yellow", stone, lite, gemRef, setting = true }: Omit<Props, "src">) {
  const band = useMemo(() => bandGeometry(), []);
  const head = useMemo(() => headGeometry(), []);
  const gem = useMemo(() => brilliantCut().geometry, []);
  const halo = useMemo(() => (RING.halo ? haloMatrices() : []), []);
  const pave = useMemo(() => (RING.pave ? paveMatrices() : []), []);
  const headMetal = RING.prongMetal === "match" ? metal : RING.prongMetal;
  // a contrasting white-metal head reflects the bright gem studio; a matching head must look exactly like the band

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const { violations, checked } = settingClearance();
    if (violations) console.warn(`[clavex] ring setting: ${violations} of ${checked} metal points sit inside the centre stone`);
  }, []);

  return (
    <group>
      <mesh geometry={band}>
        <MetalMaterial metal={metal} attach="material-0" />
        <MetalMaterial metal={metal} attach="material-1" satin />
      </mesh>
      {setting && (
        <>
          <mesh geometry={head}>
            <MetalMaterial metal={headMetal} bright={headMetal !== metal} />
          </mesh>
          {halo.length > 0 && (
            <>
              <mesh position={[0, HALO_SEAT.y, 0]} rotation-x={Math.PI / 2}>
                <torusGeometry args={[HALO_SEAT.r, HALO_SEAT.tube, 12, 96]} />
                <MetalMaterial metal={headMetal} bright={headMetal !== metal} />
              </mesh>
              <AccentStones matrices={halo} />
            </>
          )}
          {pave.length > 0 && <AccentStones matrices={pave} />}
          {/* the group sits at the stone's resting spot, so lifting it is just moving the group up */}
          <group ref={gemRef}>
            <mesh geometry={gem} position={[0, GIRDLE_Y, 0]} scale={STONE_R}>
              <DiamondMaterial stone={stone} lite={lite} />
            </mesh>
            <GemGlints />
          </group>
        </>
      )}
    </group>
  );
}
