"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { smoothScroll } from "@/config/motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

/** Lenis smooth scroll driven by GSAP's ticker, so ScrollTrigger and Lenis share one clock. */
export function SmoothScroll() {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  // new page: start at the top (unless a #hash asks otherwise) and re-measure every ScrollTrigger
  useEffect(() => {
    if (!location.hash) lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    if (reduced) return; // native scrolling for reduced-motion visitors

    const lenis = new Lenis({ duration: smoothScroll.duration, easing: smoothScroll.easing });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // let the preloader and other components pause/resume scrolling
    const stop = () => lenis.stop();
    const start = () => lenis.start();
    window.addEventListener("clavex:scroll-lock", stop);
    window.addEventListener("clavex:scroll-unlock", start);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("clavex:scroll-lock", stop);
      window.removeEventListener("clavex:scroll-unlock", start);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  return null;
}
