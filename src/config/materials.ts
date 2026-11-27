/** Metal and stone presets: labels for the UI, looks for the 3D materials. Plain data, so UI code can import it without pulling in three.js. */
export const METALS = {
  yellow: { label: "Yellow Gold", color: "#F0C46C", roughness: 0.16 },
  rose: { label: "Rose Gold", color: "#EBAE94", roughness: 0.18 },
  white: { label: "White Gold", color: "#E9E7E2", roughness: 0.12 },
  silver: { label: "Silver", color: "#D4D5D8", roughness: 0.2 },
} as const;

export type MetalKey = keyof typeof METALS;

export const STONES = {
  diamond: { label: "Diamond", color: "#ffffff", ior: 2.42, aberration: 0.018 },
  labgrown: { label: "Lab-Grown", color: "#f7fbff", ior: 2.42, aberration: 0.016 },
  emerald: { label: "Emerald", color: "#3fbf7f", ior: 1.58, aberration: 0.008 },
  sapphire: { label: "Sapphire", color: "#4a6cf0", ior: 1.77, aberration: 0.01 },
} as const;

export type StoneKey = keyof typeof STONES;
