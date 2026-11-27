/** Metal and stone presets: labels for the UI, looks for the 3D materials. Plain data, so UI code can import it without pulling in three.js. */
export const METALS = {
  yellow: { label: "Yellow Gold", color: "#F0C46C", roughness: 0.16 },
  rose: { label: "Rose Gold", color: "#EBAE94", roughness: 0.18 },
  white: { label: "White Gold", color: "#E9E7E2", roughness: 0.12 },
  silver: { label: "Silver", color: "#D4D5D8", roughness: 0.2 },
} as const;

export type MetalKey = keyof typeof METALS;

export const STONES = {
  // aberration is the rainbow "fire": keep it small, real diamonds show sparks, not stripes
  diamond: { label: "Diamond", color: "#ffffff", ior: 2.42, aberration: 0.01 },
  labgrown: { label: "Lab-Grown", color: "#fbfdff", ior: 2.42, aberration: 0.01 },
  emerald: { label: "Emerald", color: "#46c487", ior: 1.58, aberration: 0.004 },
  sapphire: { label: "Sapphire", color: "#4f72f2", ior: 1.77, aberration: 0.006 },
} as const;

export type StoneKey = keyof typeof STONES;

/** The procedural engagement ring's design options. */
export const RING = {
  /** claws, gallery and halo seat: "match" the band's metal, or a fixed metal such as "white" (white-gold claws) */
  prongMetal: "match" as MetalKey | "match",
  /** a hidden halo of small diamonds under the centre stone (off: a single solitaire, no other stones) */
  halo: false,
  /** a row of small diamonds set into each shoulder of the band (off: a single solitaire, no other stones) */
  pave: false,
};
