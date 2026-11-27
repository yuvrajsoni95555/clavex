/**
 * CLAVEX motion config: tweak the feel of the whole site here.
 * Slow, weighted, precise: long power3/expo easing, nothing bouncy.
 */

/** GSAP ease names */
export const ease = {
  out: "power3.out",
  inOut: "power3.inOut",
  expoOut: "expo.out",
  expoInOut: "expo.inOut",
} as const;

/** Same curves as cubic-bezier arrays, for CSS and Framer Motion */
export const bezier = {
  out: [0.215, 0.61, 0.355, 1],
  expoOut: [0.16, 1, 0.3, 1],
  expoInOut: [0.87, 0, 0.13, 1],
} as const;

/** Durations in seconds */
export const duration = {
  fast: 0.4,
  base: 0.8,
  slow: 1.2,
  cinematic: 1.8,
} as const;

/** Delay between letters/lines in text reveals (seconds) */
export const stagger = {
  char: 0.045,
  line: 0.12,
} as const;

export const smoothScroll = {
  duration: 1.2, // Lenis glide time; higher = heavier
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo out
};

export const cursor = {
  follow: 0.35, // seconds the dot takes to catch the pointer
  size: 8, // px, resting dot
  hoverScale: 6, // over links/buttons
  labelScale: 10, // over elements with data-cursor="View"
};

export const magnetic = {
  strength: 0.35, // share of the pointer offset the button follows
  duration: 0.9,
};

export const preloader = {
  minDuration: 1.6, // seconds; the counter never finishes faster than this
  maxWait: 3, // seconds past minDuration to wait for the 3D hero before lifting anyway
  skipOnRepeatVisit: true, // only show once per browser session
};
