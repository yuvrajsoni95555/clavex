"use client";
import { useEffect, useRef, type ElementType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { duration, ease, stagger } from "@/config/motion";
import { onSiteReady } from "@/lib/siteReady";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  /** rise letter by letter, or word by word for longer lines */
  by?: "chars" | "words";
  delay?: number;
  /** "load": after the preloader lifts; "scroll": when it enters the viewport */
  trigger?: "load" | "scroll";
};

/**
 * Text that rises out of a mask. The full text stays in the HTML as one visually-hidden string,
 * so search engines and screen readers read it normally.
 */
export function RevealText({ text, as: Tag = "span", className, by = "chars", delay = 0, trigger = "load" }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const show = () => el.setAttribute("data-revealed", "");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return show();

    const parts = el.querySelectorAll<HTMLElement>(".clx-part");
    let tween: gsap.core.Tween | undefined;
    const play = () => {
      tween = gsap.fromTo(
        parts,
        { y: 0, yPercent: 115 },
        {
          yPercent: 0,
          duration: duration.cinematic,
          ease: ease.expoOut,
          stagger: by === "chars" ? stagger.char : stagger.line,
          delay,
          onStart: show,
          scrollTrigger: trigger === "scroll" ? { trigger: el, start: "top 85%", once: true } : undefined,
        },
      );
    };
    const off = trigger === "load" ? onSiteReady(play) : (play(), undefined);
    return () => {
      off?.();
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [by, delay, trigger]);

  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className} data-reveal="">
      {/* real text for screen readers and search engines; the animated letters below are hidden from them */}
      <span className="sr-only">{text}</span>
      {words.map((word, w) => (
        <span key={w} aria-hidden="true">
          {/* the mask: clips the letters while they sit below the line */}
          <span className="inline-block overflow-hidden whitespace-nowrap pb-[0.12em] -mb-[0.12em] align-bottom">
            {by === "chars" ? (
              [...word].map((c, i) => (
                <span key={i} className="clx-part inline-block">
                  {c}
                </span>
              ))
            ) : (
              <span className="clx-part inline-block">{word}</span>
            )}
          </span>
          {w < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
}
