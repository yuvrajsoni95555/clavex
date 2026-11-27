"use client";
import { useMemo, type Ref } from "react";
import { Center, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { asset } from "@/lib/asset";
import { MetalMaterial, type MetalKey } from "./MetalMaterial";
import { DiamondMaterial, type StoneKey } from "./DiamondMaterial";

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

/** Height of the procedural gem's table above the ring centre; ScrollStory and the hero aim at it. */
export const GEM_Y = 1.42;
const GEM_SCALE = 0.34;
/** largest dimension of the procedural ring (its height); imported models are scaled to match */
const FIT_SIZE = 2.62;

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
    <group position={[0, 0.22, 0]} scale={fit}>
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

/* ---------- procedural placeholder ---------- */

/** Round brilliant silhouette spun on a lathe; 16 sides + flat normals read as facets. Girdle radius 1, table up. */
function brilliantGeometry() {
  const profile = [
    [0.0001, -0.86], // culet
    [0.52, -0.47], // pavilion break
    [1, -0.02], // girdle
    [1, 0.02],
    [0.82, 0.2], // crown
    [0.56, 0.32], // table edge
    [0.0001, 0.32], // table centre
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.LatheGeometry(profile, 16).toNonIndexed();
  g.computeVertexNormals();
  // a trivial index keeps the facets but stops drei warning when it calls toNonIndexed() again for its BVH
  g.setIndex([...Array(g.attributes.position.count).keys()]);
  return g;
}

/** Six claws from the basket up to the crown, as {position, quaternion, length}. */
function prongs(count = 6) {
  const up = new THREE.Vector3(0, 1, 0);
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + Math.PI / count;
    const base = new THREE.Vector3(Math.cos(a) * 0.16, 1.1, Math.sin(a) * 0.16);
    const tip = new THREE.Vector3(Math.cos(a) * 0.31, GEM_Y - 0.05, Math.sin(a) * 0.31); // just over the crown
    const dir = tip.clone().sub(base);
    return {
      position: base.clone().add(tip).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize()),
      length: dir.length(),
      tip,
    };
  });
}

function ProceduralSolitaire({ metal, stone, lite, gemRef, setting = true }: Omit<Props, "src">) {
  const gem = useMemo(() => brilliantGeometry(), []);
  const claws = useMemo(() => prongs(), []);

  return (
    <group>
      {/* band: a torus squashed along its axis so the shank is wider than it is thick */}
      <mesh scale={[1, 1, 1.9]}>
        <torusGeometry args={[1, 0.085, 48, 160]} />
        <MetalMaterial metal={metal} />
      </mesh>
      {setting && (
        <>
          {/* basket ring under the stone */}
          <mesh position={[0, 1.2, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.22, 0.022, 16, 48]} />
            <MetalMaterial metal={metal} />
          </mesh>
          {claws.map((c, i) => (
            <group key={i}>
              <mesh position={c.position} quaternion={c.quaternion}>
                <cylinderGeometry args={[0.02, 0.026, c.length, 12]} />
                <MetalMaterial metal={metal} />
              </mesh>
              <mesh position={c.tip}>
                <sphereGeometry args={[0.028, 12, 12]} />
                <MetalMaterial metal={metal} />
              </mesh>
            </group>
          ))}
          {/* the group sits at the stone's resting spot, so lifting it is just moving the group up */}
          <group ref={gemRef}>
            <mesh geometry={gem} position={[0, GEM_Y - 0.32 * GEM_SCALE, 0]} scale={GEM_SCALE}>
              <DiamondMaterial stone={stone} lite={lite} />
            </mesh>
          </group>
        </>
      )}
    </group>
  );
}
