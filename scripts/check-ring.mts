// Self-check for the procedural ring: diamond facet count, closed volume, and that no metal goes inside the stone.
// Run: npx tsx scripts/check-ring.mts
import * as THREE from "three";
import { brilliantCut, insideStone, CUT_HEIGHTS } from "../src/components/three/gemGeometry";
const { geometry, facets } = brilliantCut();
const key = (f: { normal: THREE.Vector3; point: THREE.Vector3 }) => [f.normal.x, f.normal.y, f.normal.z, f.normal.dot(f.point)].map((v) => Math.round(v * 1000) + 0).join(",");
const planes = new Set(facets.map(key));
const pos = geometry.attributes.position;
let vol = 0;
for (let i = 0; i < pos.count; i += 3) {
  const a = new THREE.Vector3().fromBufferAttribute(pos, i), b = new THREE.Vector3().fromBufferAttribute(pos, i + 1), c = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
  vol += a.dot(b.clone().cross(c)) / 6;
}
console.log({ triangles: pos.count / 3, uniquePlanes: planes.size, volumePositive: vol > 0, volume: vol.toFixed(3), heights: CUT_HEIGHTS });
console.assert(planes.size === 57 + 16, "expected 57 facets + 16 girdle faces");
console.assert(insideStone(new THREE.Vector3(0, 0, 0), facets), "centre must be inside");
console.assert(!insideStone(new THREE.Vector3(1.01, 0.01, 0), facets), "just outside girdle must be outside");
console.assert(!insideStone(new THREE.Vector3(0, CUT_HEIGHTS.table + 0.01, 0), facets), "above table must be outside");
console.log("checks done");

// the setting: no claw, rail or accent stone may sit inside the centre stone
import { settingClearance, haloMatrices, paveMatrices } from "../src/components/three/ringGeometry";
const clearance = settingClearance();
console.log({ clearance, halo: haloMatrices().length, pave: paveMatrices().length });
console.assert(clearance.violations === 0, `setting intersects the stone at ${clearance.violations} points`);
