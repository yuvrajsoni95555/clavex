/**
 * "Site ready" = the preloader has lifted (or was skipped).
 * Intros wait for this so they don't play behind the curtain.
 */
type W = Window & { __clxReady?: boolean; __clxWait?: Promise<unknown>[] };

export function onSiteReady(cb: () => void): () => void {
  const w = window as W;
  if (w.__clxReady) {
    cb();
    return () => {};
  }
  window.addEventListener("clavex:preloader-done", cb, { once: true });
  return () => window.removeEventListener("clavex:preloader-done", cb);
}

/** Ask the preloader to hold (up to its timeout) until this promise settles, e.g. the hero canvas. */
export function holdPreloader(p: Promise<unknown>) {
  const w = window as W;
  (w.__clxWait ??= []).push(p);
}

export function preloaderHolds(): Promise<unknown>[] {
  return (window as W).__clxWait ?? [];
}
