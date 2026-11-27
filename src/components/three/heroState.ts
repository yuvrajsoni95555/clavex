/**
 * Plain mutable values shared between the DOM (scroll, pointer, preloader) and the 3D loop.
 * Mutating them never re-renders React; useFrame reads them each frame.
 */
export const heroState = {
  /** 0 → 1 as the hero section scrolls past */
  progress: 0,
  /** 0 → 1 entrance after the preloader lifts */
  intro: 0,
  /** pointer or device tilt, each -1..1 */
  pointer: { x: 0, y: 0 },
  reduced: false,
};

/** 0 → 1 across the pinned story section (ScrollStory writes, StoryScene reads). Kept here so the page bundle never imports three.js. */
export const storyState = { progress: 0 };
