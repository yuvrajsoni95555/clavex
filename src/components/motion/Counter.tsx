"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease } from "@/config/motion";

gsap.registerPlugin(ScrollTrigger);

const fmt = new Intl.NumberFormat("en-IN");

/** Number that counts up when it scrolls in. The final value is in the HTML, so it reads fine without JS. */
export function Counter({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const num = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = num.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const state = { n: 0 };
    el.textContent = "0";
    const tween = gsap.to(state, {
      n: value,
      duration: 2.4,
      ease: ease.expoOut,
      onUpdate: () => void (el.textContent = fmt.format(Math.round(state.n))),
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value]);

  return (
    <div className="text-center">
      <p className="font-serif text-6xl font-light text-ivory md:text-7xl">
        <span ref={num} className="tabular-nums">{fmt.format(value)}</span>
        <span className="text-gold">{suffix}</span>
      </p>
      <p className="mt-3 text-xs uppercase tracking-[0.3em] text-stone">{label}</p>
    </div>
  );
}
