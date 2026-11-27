import * as THREE from "three";

/**
 * Round brilliant cut, in units of the girdle radius (girdle radius = 1, girdle bottom at y = 0, table up).
 * 57 facets: table 1, star 8, bezel 8, upper girdle 16, pavilion main 8, lower girdle 16 (no culet facet),
 * plus 16 thin girdle faces. Every facet is a true plane, so flat normals read as crisp facets.
 */
export const CUT = {
  table: 0.57, // table "radius" (corner) as a share of the girdle radius: 57% table
  crownAngle: THREE.MathUtils.degToRad(34.5),
  pavilionAngle: THREE.MathUtils.degToRad(40.8),
  girdle: 0.03, // girdle thickness
  star: 0.78, // radial position of the star-facet points (~53% star length)
  lowerHalf: 0.22, // radial position where the lower-girdle facets meet the mains (~78% lower halves)
};

const tanC = Math.tan(CUT.crownAngle);
const tanP = Math.tan(CUT.pavilionAngle);
/** heights in girdle-radius units */
export const CUT_HEIGHTS = {
  girdleTop: CUT.girdle,
  table: CUT.girdle + (1 - CUT.table) * tanC,
  culet: -tanP,
};

const dir = (a: number) => new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
const at = (a: number, r: number, y: number) => dir(a).multiplyScalar(r).setY(y);

export type Facet = { normal: THREE.Vector3; point: THREE.Vector3 };

export function brilliantCut() {
  const step = Math.PI / 4; // 8-fold symmetry
  const half = step / 2;
  const yG = CUT_HEIGHTS.girdleTop;
  const yT = CUT_HEIGHTS.table;

  // points on a bezel / pavilion-main plane, which runs along main direction k
  const crownY = (p: THREE.Vector3, k: number) => yG + (1 - p.dot(dir(k * step))) * tanC;
  const pavY = (p: THREE.Vector3, k: number) => -(1 - p.dot(dir(k * step))) * tanP;

  const T = (k: number) => at(k * step, CUT.table, yT);
  const S = (k: number) => {
    const p = at(k * step + half, CUT.star, 0);
    return p.setY(crownY(p, k));
  };
  const Q = (k: number) => {
    const p = at(k * step + half, CUT.lowerHalf, 0);
    return p.setY(pavY(p, k));
  };
  const G = (k: number, y: number) => at(k * step, 1, y); // girdle point on a main direction
  const M = (k: number, y: number) => at(k * step + half, 1, y); // girdle point between mains
  const culet = new THREE.Vector3(0, CUT_HEIGHTS.culet, 0);

  const tris: THREE.Vector3[][] = [];
  const centre = new THREE.Vector3(0, (yT + CUT_HEIGHTS.culet) / 2, 0);
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    // wind every triangle outward, so normals and the inside test don't depend on the order written here
    const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    const mid = a.clone().add(b).add(c).divideScalar(3);
    tris.push(n.dot(mid.sub(centre)) >= 0 ? [a, b, c] : [a, c, b]);
  };

  for (let k = 0; k < 8; k++) {
    const k1 = (k + 1) % 8;
    tri(T(0), T(k), T(k1)); // table (fan)
    tri(T(k), T(k1), S(k)); // star
    tri(T(k), S((k + 7) % 8), G(k, yG)); // bezel, two halves of one plane
    tri(T(k), G(k, yG), S(k));
    tri(S(k), G(k, yG), M(k, yG)); // upper girdle
    tri(S(k), M(k, yG), G(k1, yG));
    tri(G(k, 0), M(k, 0), M(k, yG)); // girdle faces
    tri(G(k, 0), M(k, yG), G(k, yG));
    tri(M(k, 0), G(k1, 0), G(k1, yG));
    tri(M(k, 0), G(k1, yG), M(k, yG));
    tri(Q(k), M(k, 0), G(k, 0)); // lower girdle
    tri(Q(k), G(k1, 0), M(k, 0));
    tri(culet, Q((k + 7) % 8), G(k, 0)); // pavilion main, two halves of one plane
    tri(culet, G(k, 0), Q(k));
  }
  // the table fan writes degenerate triangles at k = 0 and 7; drop them
  const faces = tris.filter(([a, b, c]) => new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).lengthSq() > 1e-10);

  const positions = new Float32Array(faces.length * 9);
  faces.forEach((f, i) => f.forEach((v, j) => v.toArray(positions, i * 9 + j * 3)));
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals(); // non-indexed: each triangle gets its own flat normal
  // a trivial index keeps the facets but stops drei warning when it calls toNonIndexed() for its BVH
  geometry.setIndex([...Array(faces.length * 3).keys()]);

  const facets: Facet[] = faces.map(([a, b, c]) => ({
    normal: new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize(),
    point: a.clone(),
  }));
  return { geometry, facets };
}

/** The stone is convex: a point is inside when it is behind every facet plane. `margin` grows the stone outward. */
export function insideStone(p: THREE.Vector3, facets: Facet[], margin = 0) {
  return facets.every((f) => f.normal.dot(p.clone().sub(f.point)) < margin);
}
