"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ease } from "@/config/motion";
import { heroState } from "@/components/three/heroState";
import { RevealText } from "@/components/motion/RevealText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { holdPreloader, onSiteReady } from "@/lib/siteReady";
import { deviceProfile, loadWhenEngaged } from "@/lib/device";
import { asset } from "@/lib/asset";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

// three.js only loads in the browser, after first paint; the text and poster are server-rendered
const HeroScene = dynamic(() => import("@/components/three/HeroScene"), { ssr: false });

const clamp = (v: number) => Math.max(-1, Math.min(1, v));

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const canvasFade = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const wordmark = useRef<HTMLDivElement>(null);
  const readyResolve = useRef<() => void>(() => {});

  const [scene, setScene] = useState<{ lite: boolean; reduced: boolean } | null>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const { reduced, lite, webgl } = deviceProfile();
    heroState.reduced = reduced;
    heroState.intro = reduced ? 1 : 0;

    // no WebGL → the poster photo simply stays. Desktop loads 3D straight away (the preloader waits for it);
    // phones keep the poster until the first touch or scroll, so three.js never delays first paint there.
    if (webgl && !lite) holdPreloader(new Promise<void>((r) => (readyResolve.current = r)));
    const cancelLoad = webgl ? loadWhenEngaged(lite, () => setScene({ lite, reduced })) : () => {};

    const offReady = onSiteReady(() => {
      if (!reduced) gsap.to(heroState, { intro: 1, duration: 2.6, ease: ease.expoOut });
    });

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      heroState.pointer.x = (e.clientX / innerWidth) * 2 - 1;
      heroState.pointer.y = -((e.clientY / innerHeight) * 2 - 1);
    };
    // phone tilt (Android; iOS needs a permission prompt, so it simply stays still there)
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      heroState.pointer.x = clamp(e.gamma / 30);
      heroState.pointer.y = clamp((45 - e.beta) / 30);
    };
    if (!reduced) {
      window.addEventListener("pointermove", onPointer);
      window.addEventListener("deviceorientation", onTilt);
    }

    // stop rendering once the hero is fully scrolled past
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));
    io.observe(section.current!);

    // scroll: copy lifts away first, the wordmark next, then the whole scene fades into the next section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (s) => (heroState.progress = s.progress),
      },
    });
    tl.to(copy.current, { opacity: 0, y: -40, ease: "none", duration: 0.3 }, 0)
      .to(wordmark.current, { opacity: 0, y: 60, ease: "none", duration: 0.35 }, 0.3)
      .to(canvasFade.current, { opacity: 0, ease: "none", duration: 0.3 }, 0.7);

    return () => {
      cancelLoad();
      offReady();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
      io.disconnect();
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const onSceneReady = () => {
    // one frame later, so the first rendered frame is on screen before it fades in
    requestAnimationFrame(() => {
      setReady(true);
      readyResolve.current();
    });
  };

  return (
    <section ref={section} className="relative h-[220svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* soft studio glow behind everything */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_50%_45%,rgba(201,169,110,0.14),transparent_70%)]"
        />

        <div ref={wordmark} className="pointer-events-none absolute inset-x-0 bottom-[5svh] flex justify-center">
          {/* select-none: a long-press must never paint the logo with the gold text-selection colour */}
          <RevealText
            as="h1"
            text="CLAVEX"
            delay={0.4}
            className="select-none font-serif text-[24vw] font-light leading-[0.8] tracking-[0.05em] text-ivory/90 md:text-[17vw]"
          />
        </div>

        <div ref={canvasFade} aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
          {/* poster: a still of the ring where the 3D one will appear. It is the page's LCP image, shown
              until the canvas is ready, and stays as the fallback without WebGL. Swap in a real photo anytime. */}
          <div
            className={`absolute left-1/2 top-[65%] aspect-[4/5] h-[52svh] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-[1500ms] md:top-[47%] md:h-[72svh] ${ready ? "opacity-0" : "opacity-100"}`}
          >
            <Image src={asset("/products/aurelia-solitaire.webp")} alt="" fill preload fetchPriority="high" sizes="(min-width: 768px) 60vh, 45vh" className="object-contain" />
          </div>
          <div className={`relative h-full w-full transition-opacity duration-[2000ms] ${ready ? "opacity-100" : "opacity-0"}`}>
            {scene && <HeroScene active={active} lite={scene.lite} reduced={scene.reduced} onReady={onSceneReady} />}
          </div>
        </div>

        <div
          ref={copy}
          className="absolute inset-x-0 top-[16svh] flex flex-col items-center gap-8 px-6 text-center md:top-[20svh] md:flex-row md:items-start md:justify-between md:px-12 md:text-left"
        >
          <div>
            <RevealText text="Fine Jewellery" by="words" delay={0.9} className="block text-xs uppercase tracking-[0.5em] text-gold" />
            <RevealText
              as="p"
              text="Light, held in gold."
              by="words"
              delay={1.05}
              className="mt-4 font-serif text-3xl font-light italic text-ivory md:text-4xl"
            />
          </div>
          <div className="flex flex-col items-center gap-6 md:items-end">
            <RevealText
              as="p"
              text="Certified diamonds and lab-grown brilliance, set by hand."
              by="words"
              delay={1.2}
              className="hidden max-w-[18rem] text-sm leading-relaxed text-stone md:block md:text-right"
            />
            <MagneticButton>
              <a
                href="#collections"
                className="block border border-gold/70 px-9 py-4 text-xs uppercase tracking-[0.35em] text-gold transition-colors duration-700 hover:bg-gold hover:text-ink"
              >
                Discover
              </a>
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}

