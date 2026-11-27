"use client";
import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ease, magnetic } from "@/config/motion";

type Props = {
  children: ReactNode;
  className?: string;
  /** share of the pointer offset to follow, 0..1 */
  strength?: number;
};

/** Wrap a button or link: it leans toward the mouse and settles back slowly on leave. */
export function MagneticButton({ children, className, strength = magnetic.strength }: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const x = gsap.quickTo(el, "x", { duration: magnetic.duration, ease: ease.out });
    const y = gsap.quickTo(el, "y", { duration: magnetic.duration, ease: ease.out });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * strength);
      y((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => {
      x(0);
      y(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block will-change-transform ${className ?? ""}`}>
      {children}
    </span>
  );
}
