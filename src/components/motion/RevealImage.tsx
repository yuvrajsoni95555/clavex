"use client";
import { useEffect, useRef } from "react";
import Image, { type ImageProps } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease } from "@/config/motion";

gsap.registerPlugin(ScrollTrigger);

type Props = Omit<ImageProps, "fill"> & {
  /** CSS aspect-ratio of the frame, e.g. "16/10" */
  aspect: string;
  /** drift the image inside its frame while scrolling */
  parallax?: boolean;
  frameClassName?: string;
};

/** Image that opens upward from a mask when it scrolls in; optionally drifts (parallax) inside its frame. */
export function RevealImage({ aspect, parallax = false, frameClassName = "", className = "", alt, ...img }: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current!;
    const show = () => el.setAttribute("data-revealed", "");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return show();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { clipPath: "inset(100% 0% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.6,
          ease: ease.expoInOut,
          onStart: show,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
      if (parallax) {
        gsap.fromTo(
          inner.current,
          { yPercent: -7 },
          { yPercent: 7, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
        );
      }
    });
    return () => ctx.revert();
  }, [parallax]);

  return (
    <div ref={frame} data-reveal-img="" className={`relative overflow-hidden ${frameClassName}`} style={{ aspectRatio: aspect }}>
      {/* oversized when drifting so the edges never show */}
      <div ref={inner} className={`absolute inset-x-0 ${parallax ? "-inset-y-[8%]" : "inset-y-0"}`}>
        <Image {...img} alt={alt} fill className={className} />
      </div>
    </div>
  );
}
