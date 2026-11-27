/**
 * CLAVEX theme tokens: the one place to change colours.
 * layout.tsx writes these onto <html> as CSS variables, and globals.css maps them
 * to Tailwind utilities (bg-ink, text-ivory, text-gold, ...). 3D code imports them directly.
 */
export const colors = {
  ink: "#0B0B0B", // deep black, page background
  ivory: "#F5F1E8", // primary text on dark
  gold: "#C9A96E", // champagne gold accent
  goldSoft: "#E3CFA4", // highlight / hover gold
  stone: "#8A847A", // soft warm grey, secondary text
  line: "#2A2724", // hairlines and borders on dark
} as const;

export type ColorToken = keyof typeof colors;

/** CSS variable name for each token, e.g. ink -> --clx-ink */
export const cssVars = Object.fromEntries(
  Object.entries(colors).map(([k, v]) => [`--clx-${k}`, v]),
) as Record<string, string>;
