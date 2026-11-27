"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { cursor, ease } from "@/config/motion";

const INTERACTIVE = "a, button, [role='button'], [data-cursor], input[type='submit']";

/**
 * Small gold dot that trails the pointer. Grows over links and buttons;
 * over elements with data-cursor="View" (product cards) it shows that label.
 * Only on mouse/trackpad devices; touch keeps the native behaviour.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setEnabled(fine.matches);
    update();
    fine.addEventListener("change", update);
    return () => fine.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled || !wrap.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const follow = reduced ? 0 : cursor.follow;
    document.documentElement.classList.add("clx-has-cursor");

    const x = gsap.quickTo(wrap.current, "x", { duration: follow, ease: ease.out });
    const y = gsap.quickTo(wrap.current, "y", { duration: follow, ease: ease.out });
    gsap.set(wrap.current, { opacity: 0 });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x(e.clientX);
      y(e.clientY);
      gsap.to(wrap.current, { opacity: 1, duration: 0.3, overwrite: "auto" });
    };

    let current: Element | null = null;
    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element).closest(INTERACTIVE);
      if (target === current) return;
      current = target;
      const text = target?.getAttribute("data-cursor") || "";
      const scale = !target ? 1 : text ? cursor.labelScale : cursor.hoverScale;
      gsap.to(dot.current, {
        scale,
        backgroundColor: target ? "rgba(201,169,110,0.18)" : "var(--clx-gold)",
        borderColor: target ? "rgba(201,169,110,0.6)" : "transparent",
        duration: 0.5,
        ease: ease.out,
      });
      if (label.current) label.current.textContent = text;
      gsap.to(label.current, { opacity: text ? 1 : 0, duration: 0.3 });
    };

    const onLeave = () => gsap.to(wrap.current, { opacity: 0, duration: 0.3 });

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("clx-has-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={wrap}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[90]"
      style={{ willChange: "transform" }}
    >
      <div
        ref={dot}
        className="absolute rounded-full border bg-gold"
        style={{
          width: cursor.size,
          height: cursor.size,
          left: -cursor.size / 2,
          top: -cursor.size / 2,
          borderColor: "transparent",
          borderWidth: 1 / cursor.hoverScale, // stays a hairline once scaled up
        }}
      />
      <span
        ref={label}
        className="absolute -translate-x-1/2 -translate-y-1/2 font-sans text-xs uppercase tracking-[0.3em] text-ivory opacity-0"
      />
    </div>
  );
}
