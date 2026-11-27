/**
 * The scroll story: one entry per chapter. Copy on the left, and where the camera sits for it.
 * Positions are in ring units (band radius = 1, stone table at y = 1.42).
 * Copy is placeholder: check every claim (certification, lifetime care) against what CLAVEX actually offers.
 */
export type StoryStep = {
  title: string;
  body: string;
  detail: string;
  camera: [number, number, number];
  look: [number, number, number];
  /** ring turn around its axis, radians */
  turn: number;
  /** how far the stone floats above its setting */
  lift: number;
};

export const story: StoryStep[] = [
  {
    title: "Handcrafted",
    body: "Every band is shaped, filed and polished by hand at the bench, so no two pieces are ever quite alike.",
    detail: "Forged · filed · hand-polished",
    camera: [4.4, 0.8, 6.0],
    look: [0.6, 0.3, 0], // aim a little right of the ring so it sits clear of the copy
    turn: 0.9,
    lift: 0,
  },
  {
    title: "Certified Diamonds",
    body: "Each natural stone is graded by an independent laboratory for cut, colour, clarity and carat, and arrives with its certificate.",
    detail: "Cut · colour · clarity · carat",
    camera: [1.0, 2.6, 2.7],
    look: [0.2, 1.3, 0],
    turn: 1.7,
    lift: 0,
  },
  {
    title: "Lab-Grown Brilliance",
    body: "Grown above ground, chemically identical to a mined diamond, with the same fire and the same hardness.",
    detail: "Pure carbon · 10 on the Mohs scale",
    camera: [3.0, 1.9, 3.7],
    look: [0.25, 1.6, 0],
    turn: 2.5,
    lift: 0.75,
  },
  {
    title: "Lifetime Shine",
    body: "Bring it back whenever you like. We clean, check and re-polish every CLAVEX piece for as long as you own it.",
    detail: "Complimentary care, for life",
    camera: [-3.1, 1.3, 6.2],
    look: [0, 0.4, 0],
    turn: 3.9,
    lift: 0,
  },
];
