"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { duration, ease, preloader } from "@/config/motion";
import { preloaderHolds } from "@/lib/siteReady";

const SEEN_KEY = "clx-preloaded";

/**
 * Thin diamond outline that draws itself with a % counter, then a curtain lifts.
 * Rendered on the server so content never flashes before it; removes itself when done
 * and fires "clavex:preloader-done" so the hero can start its own intro.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const outline = useRef<SVGPathElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const finish = () => {
      sessionStorage.setItem(SEEN_KEY, "1"); // set on finish, not start, so a StrictMode re-run still plays it
      setDone(true);
      window.dispatchEvent(new Event("clavex:scroll-unlock"));
      window.dispatchEvent(new Event("clavex:preloader-done"));
      (window as Window & { __clxReady?: boolean }).__clxReady = true;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (preloader.skipOnRepeatVisit && sessionStorage.getItem(SEEN_KEY)) return finish();
    window.dispatchEvent(new Event("clavex:scroll-lock"));

    const pageLoaded = new Promise<void>((r) =>
      document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true }),
    );
    const assetsReady = Promise.all([pageLoaded, document.fonts.ready]);

    const progress = { p: 0 };
    const render = () => {
      const p = Math.round(progress.p);
      if (counter.current) counter.current.textContent = String(p).padStart(2, "0");
      if (outline.current) outline.current.style.strokeDashoffset = String(1 - progress.p / 100);
      if (bar.current) bar.current.style.transform = `scaleX(${progress.p / 100})`;
    };

    let cancelled = false;
    const tweens: gsap.core.Animation[] = [];
    const play = <T extends gsap.core.Animation>(a: T) => (tweens.push(a), a);

    const run = async () => {
      if (reduced) {
        await assetsReady;
        if (cancelled) return;
        await play(gsap.to(root.current, { opacity: 0, duration: duration.fast }));
        return finish();
      }
      // count to 90 while assets load, the last 10% only once they really are ready
      const intro = play(gsap.to(progress, { p: 90, duration: preloader.minDuration, ease: ease.out, onUpdate: render }));
      await Promise.all([intro, assetsReady]);
      // also wait for anything that asked to be ready first (the hero canvas), but never forever
      await Promise.race([Promise.all(preloaderHolds()), new Promise((r) => setTimeout(r, preloader.maxWait * 1000))]);
      if (cancelled) return;
      await play(gsap.to(progress, { p: 100, duration: duration.fast, ease: ease.out, onUpdate: render }));
      if (cancelled) return;

      const marks = root.current!.querySelectorAll("[data-preloader-mark]");
      const tl = play(gsap.timeline());
      tl.to(marks, { opacity: 0, y: -12, duration: duration.base, ease: ease.inOut, stagger: 0.06 })
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: duration.slow, ease: ease.expoInOut }, "-=0.2");
      await tl;
      if (!cancelled) finish();
    };
    run();

    return () => {
      cancelled = true;
      tweens.forEach((t) => t.kill());
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      id="clx-preloader"
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
      style={{ clipPath: "inset(0 0 0% 0)" }}
    >
      <svg data-preloader-mark viewBox="0 0 100 100" className="h-20 w-20 animate-[clx-spin_6s_linear_infinite]">
        {/* brilliant-cut silhouette: table, crown and pavilion */}
        <path
          ref={outline}
          d="M30 30 H70 L88 44 L50 88 L12 44 Z M12 44 H88 M30 30 L40 44 L50 88 M70 30 L60 44 L50 88 M40 44 L50 30 L60 44"
          pathLength={1}
          fill="none"
          stroke="var(--clx-gold)"
          strokeWidth={0.8}
          strokeLinejoin="round"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
        />
      </svg>
      <div data-preloader-mark className="mt-8 h-px w-40 overflow-hidden bg-line">
        <div ref={bar} className="h-full w-full origin-left bg-gold" style={{ transform: "scaleX(0)" }} />
      </div>
      <span data-preloader-mark className="mt-4 font-sans text-xs tracking-[0.4em] text-stone tabular-nums">
        <span ref={counter}>00</span>%
      </span>
    </div>
  );
}
