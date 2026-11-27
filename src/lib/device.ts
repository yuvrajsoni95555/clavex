/** Browser-only checks that decide how heavy a 3D scene may be. Call inside effects, never during render. */
export function deviceProfile() {
  return {
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    /** phones and tablets: fewer particles, cheaper refraction, lower pixel ratio */
    lite: window.matchMedia("(max-width: 767px), (pointer: coarse)").matches,
    webgl: !!document.createElement("canvas").getContext("webgl2"),
  };
}

/**
 * Run `load` now on capable devices; on phones wait for the visitor's first touch, scroll or key,
 * so three.js never competes with first paint and the first seconds of interactivity.
 * Returns a cleanup that cancels the wait.
 */
export function loadWhenEngaged(lite: boolean, load: () => void): () => void {
  if (!lite) {
    load();
    return () => {};
  }
  const events = ["pointerdown", "touchstart", "wheel", "scroll", "keydown"] as const;
  const go = () => {
    stop();
    load();
  };
  const stop = () => events.forEach((e) => window.removeEventListener(e, go));
  events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
  return stop;
}
