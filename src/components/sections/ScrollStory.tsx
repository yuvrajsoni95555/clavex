"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { story } from "@/config/story";
import { storyState } from "@/components/three/heroState";
import { deviceProfile } from "@/lib/device";

gsap.registerPlugin(ScrollTrigger);

const StoryScene = dynamic(() => import("@/components/three/StoryScene"), { ssr: false });

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Pinned section (CSS sticky, so it works with Lenis and without JS): scrolling drives the
 * camera around the ring while the four chapters of copy hand over to each other.
 */
export function ScrollStory() {
  const section = useRef<HTMLElement>(null);
  const panels = useRef<HTMLElement[]>([]);
  const counter = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  const [lite, setLite] = useState<boolean | null>(null); // null = don't mount 3D (yet, or no WebGL)
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { lite, webgl } = deviceProfile();

    // mount the canvas only once the section is within half a screen, and stop it when it leaves
    const io = new IntersectionObserver(
      ([e]) => {
        setActive(e.isIntersecting);
        if (e.isIntersecting && webgl) setLite((l) => l ?? lite);
      },
      { rootMargin: "50% 0px" },
    );
    io.observe(section.current!);

    const last = story.length - 1;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (s) => {
          storyState.progress = s.progress;
          if (counter.current) counter.current.textContent = pad(Math.round(s.progress * last) + 1);
          if (bar.current) bar.current.style.transform = `scaleY(${s.progress})`;
        },
      },
    });
    // timeline runs 0 → last, one unit per chapter; copy swaps in the gaps while the camera travels
    panels.current.forEach((panel, i) => {
      if (i > 0) tl.fromTo(panel, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, i - 0.3);
      if (i < last) tl.to(panel, { opacity: 0, y: -40, duration: 0.25, ease: "power2.in" }, i + 0.3);
    });
    tl.set({}, {}, last);

    return () => {
      io.disconnect();
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section ref={section} id="craft" aria-label="The craft" style={{ height: `${story.length * 110 + 40}svh` }} className="relative">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* poster glow, then the 3D piece: full screen on phones, right side on desktop */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 md:left-[34%]">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_45%,rgba(201,169,110,0.1),transparent_70%)]" />
          <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${ready ? "opacity-100" : "opacity-0"}`}>
            {lite !== null && <StoryScene active={active} lite={lite} onReady={() => setReady(true)} />}
          </div>
        </div>

        {/* soft fade so the copy stays readable where it sits over the ring on phones */}
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/80 to-transparent md:hidden" />

        <div className="absolute inset-x-0 bottom-[8svh] px-6 md:inset-y-0 md:bottom-auto md:left-0 md:flex md:w-[38%] md:flex-col md:justify-center md:pl-12 md:pr-0 md:pt-20">
          <p className="mb-6 text-xs uppercase tracking-[0.5em] text-gold md:mb-10">The craft</p>

          <div className="relative min-h-[15rem] md:min-h-[20rem]">
            {story.map((step, i) => (
              <article
                key={step.title}
                ref={(el) => void (el && (panels.current[i] = el))}
                className={`absolute inset-x-0 top-0 ${i > 0 ? "opacity-0" : ""}`}
              >
                <span className="font-sans text-xs tracking-[0.3em] text-stone">{pad(i + 1)}</span>
                <h2 className="mt-3 font-serif text-4xl font-light leading-tight md:text-6xl">{step.title}</h2>
                <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/75 md:text-base">{step.body}</p>
                <p className="mt-6 text-xs uppercase tracking-[0.3em] text-gold">{step.detail}</p>
              </article>
            ))}
          </div>

          {/* chapter counter + progress line */}
          <div aria-hidden="true" className="mt-8 flex items-center gap-4 text-xs tracking-[0.3em] text-stone md:mt-12">
            <span ref={counter} className="tabular-nums text-ivory">01</span>
            <div className="h-10 w-px overflow-hidden bg-line">
              <div ref={bar} className="h-full w-full origin-top bg-gold" style={{ transform: "scaleY(0)" }} />
            </div>
            <span className="tabular-nums">{pad(story.length)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
