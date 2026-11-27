"use client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { duration, ease } from "@/config/motion";

const NAVIGATE = "clavex:navigate";

/** Ask for a curtain transition to `href` (TransitionLink does this). */
export const navigateWithCurtain = (href: string) => window.dispatchEvent(new CustomEvent(NAVIGATE, { detail: href }));

/**
 * An ink curtain with a gold hairline: rises to cover the page, the route changes underneath,
 * then it lifts away. Browser back/forward skip the cover and just change the page.
 */
export function PageTransition() {
  const curtain = useRef<HTMLDivElement>(null);
  const covered = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onNavigate = (e: Event) => {
      const href = (e as CustomEvent<string>).detail;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
      gsap.set(curtain.current, { transformOrigin: "50% 100%", scaleY: 0, display: "block" });
      gsap.to(curtain.current, {
        scaleY: 1,
        duration: duration.base,
        ease: ease.expoInOut,
        onComplete: () => {
          covered.current = true;
          router.push(href);
        },
      });
    };
    window.addEventListener(NAVIGATE, onNavigate);
    return () => window.removeEventListener(NAVIGATE, onNavigate);
  }, [router]);

  // the new page has rendered: lift the curtain off the top
  useEffect(() => {
    if (!covered.current) return;
    covered.current = false;
    gsap.set(curtain.current, { transformOrigin: "50% 0%" });
    gsap.to(curtain.current, {
      scaleY: 0,
      duration: duration.slow,
      ease: ease.expoInOut,
      delay: 0.1,
      onComplete: () => void gsap.set(curtain.current, { display: "none" }),
    });
  }, [pathname]);

  return (
    <div ref={curtain} aria-hidden="true" className="fixed inset-0 z-[95] hidden bg-ink" style={{ transform: "scaleY(0)" }}>
      <div className="absolute inset-x-0 top-0 h-px bg-gold/60" />
      <div className="absolute inset-0 flex items-center justify-center font-serif text-2xl font-light tracking-[0.4em] text-ivory/80">
        CLAVEX
      </div>
    </div>
  );
}
