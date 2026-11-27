import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { brilliantCut, insideStone, CUT_HEIGHTS } from "./gemGeometry";

/*
 * The procedural solitaire, in ring units: band centre-line radius 1, band in the XY plane, stone on top (+Y).
 * Real proportions: a ~17 mm finger, ~6.5 mm (1 ct) stone.
 */

export const STONE_R = 0.36; // girdle radius
export const CULET_Y = 1.13; // just above the band, inside the basket
export const GIRDLE_Y = CULET_Y - CUT_HEIGHTS.culet * STONE_R; // girdle bottom
export const TABLE_Y = GIRDLE_Y + CUT_HEIGHTS.table * STONE_R;
export const PRONG_COUNT = 6; // the copy says "six claws, set by hand"
const GAP = 0.012; // air between metal and stone

/* ---------- band: comfort-fit, tapering slightly toward the head ---------- */

/** 0 at the bottom of the band, 1 under the stone */
const topness = (angleFromX: number) => (1 + Math.sin(angleFromX)) / 2;
const halfThickness = (f: number) => 0.085 - 0.012 * f;
const halfWidth = (f: number) => 0.16 - 0.045 * f * f;

export function bandGeometry() {
  // a thin tube, reshaped below (a fat one would put its inner vertices on the axis, where the angle is undefined)
  const TUBE = 0.1;
  const torus = new THREE.TorusGeometry(1, TUBE, 48, 220);
  const p = torus.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.y, v.x);
    const radial = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    const off = v.clone().sub(radial).divideScalar(TUBE); // offset from the centre-line, as a point on the unit circle
    const f = topness(a);
    const r = off.dot(radial); // -1 inside of the finger .. +1 outside
    // comfort fit: the inside is domed, the outside a touch flatter
    const t = halfThickness(f) * (r < 0 ? 1 : 0.92 + 0.08 * Math.abs(off.z));
    p.setXYZ(i, ...radial.multiplyScalar(1 + r * t).setZ(off.z * halfWidth(f)).toArray());
  }
  // weld the torus seams (duplicated vertices) so normals are smooth there too, with no visible line
  const g = mergeVertices(torus.deleteAttribute("normal").deleteAttribute("uv"));
  g.computeVertexNormals();
  const p2 = g.attributes.position;
  // two material groups: 0 = outside (mirror polish), 1 = inside of the finger (satin, so it shows soft
  // gradients instead of a magnified, hard-edged reflection like a concave mirror)
  const idx = g.index!;
  const outer: number[] = [];
  const inner: number[] = [];
  for (let i = 0; i < idx.count; i += 3) {
    const tri = [idx.getX(i), idx.getX(i + 1), idx.getX(i + 2)];
    const c = tri.reduce((acc, k) => acc.add(v.fromBufferAttribute(p2, k)), new THREE.Vector3()).divideScalar(3);
    (Math.hypot(c.x, c.y) < 1 ? inner : outer).push(...tri);
  }
  g.setIndex([...outer, ...inner]);
  g.clearGroups();
  g.addGroup(0, outer.length, 0);
  g.addGroup(outer.length, inner.length, 1);
  return g;
}

/** outer surface radius of the band at a given angle from the top */
const bandOuter = (fromTop: number) => 1 + halfThickness(topness(Math.PI / 2 - fromTop)) * 0.92;

/* ---------- claws ---------- */

/**
 * One claw's path in its own radial plane: (u = distance from the stone's axis, y = height).
 * It starts on the band, climbs outside the pavilion, touches the girdle from outside,
 * then bends in over the very edge of the crown. Never across the table.
 */
const CLAW_PATH: [number, number][] = [
  [0.1, 1.07],
  [0.16, 1.17],
  [0.27, 1.3],
  [0.365, 1.4],
  [STONE_R + 0.019 + GAP, GIRDLE_Y + 0.006], // touching the girdle from outside
  [0.39, GIRDLE_Y + 0.045],
  [0.335, TABLE_Y - 0.054], // tip: rests on the crown just inside the girdle
];
const CLAW_BASE = 0.026;
const CLAW_TIP = 0.017;

function clawGeometry(angle: number) {
  const d = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
  const pts = CLAW_PATH.map(([u, y]) => d.clone().multiplyScalar(u).setY(y));
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const segs = 64;
  const radial = 12;
  const tube = new THREE.TubeGeometry(curve, segs, 1, radial, false);
  // taper: TubeGeometry writes rings of (radial + 1) vertices around curve.getPointAt(i / segs)
  const p = tube.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const c = curve.getPointAt(i / segs);
    const r = THREE.MathUtils.lerp(CLAW_BASE, CLAW_TIP, Math.pow(i / segs, 0.8));
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r).add(c);
      p.setXYZ(k, v.x, v.y, v.z);
    }
  }
  tube.computeVertexNormals();
  const tip = new THREE.SphereGeometry(CLAW_TIP, 16, 12).translate(...pts[pts.length - 1].toArray());
  return mergeGeometries([tube.toNonIndexed(), tip.toNonIndexed()]);
}

export const clawAngles = () => Array.from({ length: PRONG_COUNT }, (_, i) => ((i + 0.5) / PRONG_COUNT) * Math.PI * 2);

/** the whole head in one geometry: claws, two gallery rails, and the shoulders that join it to the band */
export function headGeometry() {
  const parts = clawAngles().map(clawGeometry);
  // gallery rails: horizontal rings tying the claws together under the stone
  const rail = (y: number, r: number, tube: number) => new THREE.TorusGeometry(r, tube, 12, 96).rotateX(Math.PI / 2).translate(0, y, 0);
  parts.push(rail(1.3, 0.268, 0.011).toNonIndexed(), rail(1.165, 0.155, 0.013).toNonIndexed());
  // shoulders: a pair of curved bridges each side, from the band up into the basket
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const curve = new THREE.CatmullRomCurve3(
        [
          [0.34, 1.035],
          [0.25, 1.09],
          [0.17, 1.165],
        ].map(([x, y]) => new THREE.Vector3(sx * x, y, sz * 0.065)),
      );
      parts.push(new THREE.TubeGeometry(curve, 24, 0.02, 10, false).toNonIndexed());
    }
  const merged = mergeGeometries(parts);
  merged.computeVertexNormals();
  return merged;
}

/* ---------- accent stones (hidden halo + pavé), as instance transforms ---------- */

export const ACCENT_R = 0.026; // girdle radius of the small stones

const place = (pos: THREE.Vector3, facing: THREE.Vector3) =>
  new THREE.Matrix4().compose(
    pos,
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), facing.normalize()),
    new THREE.Vector3().setScalar(ACCENT_R),
  );

/** small stones circling the pavilion just under the girdle, between the claws */
export function haloMatrices() {
  const out: THREE.Matrix4[] = [];
  const r = 0.372;
  const y = 1.398;
  for (let s = 0; s < PRONG_COUNT; s++) {
    const centre = (s / PRONG_COUNT) * Math.PI * 2; // halfway between two claws
    for (const off of [-13.5, -4.5, 4.5, 13.5]) {
      const a = centre + THREE.MathUtils.degToRad(off);
      const d = new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      out.push(place(d.clone().multiplyScalar(r).setY(y), d.clone().setY(0.35)));
    }
  }
  return out;
}
export const HALO_SEAT = { y: 1.38, r: 0.372, tube: 0.014 };

/** a single row of stones set into the top of the band on each shoulder */
export function paveMatrices() {
  const out: THREE.Matrix4[] = [];
  for (const side of [-1, 1])
    for (let deg = 15; deg <= 39; deg += 3) {
      const a = THREE.MathUtils.degToRad(deg) * side;
      const outward = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
      // sunk so only the crown shows, like stones set in a channel
      out.push(place(outward.clone().multiplyScalar(bandOuter(Math.abs(a)) - 0.006), outward.clone()));
    }
  return out;
}

/* ---------- clearance check ---------- */

/** Counts metal vertices that sit inside the centre stone (or closer than GAP). 0 means the setting is clean. */
export function settingClearance() {
  const { facets } = brilliantCut();
  const head = headGeometry();
  const p = head.attributes.position;
  const v = new THREE.Vector3();
  let violations = 0;
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const local = new THREE.Vector3(v.x, v.y - GIRDLE_Y, v.z).divideScalar(STONE_R);
    if (insideStone(local, facets, (GAP * 0.5) / STONE_R)) violations++;
  }
  // accent stones must not touch the centre stone either
  for (const m of haloMatrices()) {
    const pos = new THREE.Vector3().setFromMatrixPosition(m);
    const local = new THREE.Vector3(pos.x, pos.y - GIRDLE_Y, pos.z).divideScalar(STONE_R);
    if (insideStone(local, facets, ACCENT_R / STONE_R)) violations++;
  }
  return { checked: p.count, violations };
}
