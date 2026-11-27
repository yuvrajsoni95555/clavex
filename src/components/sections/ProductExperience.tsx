"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { METALS, STONES, type MetalKey, type StoneKey } from "@/config/materials";
import { formatPrice, productImage, type Product } from "@/data/products";
import { deviceProfile } from "@/lib/device";
import { heroState } from "@/components/three/heroState";
import type { ViewerApi } from "@/components/three/ProductViewer";
import { RevealText } from "@/components/motion/RevealText";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { SITE } from "@/config/site";

const ProductViewer = dynamic(() => import("@/components/three/ProductViewer"), { ssr: false });


type Device = { lite: boolean; reduced: boolean; touch: boolean };

/** Product page body: 3D viewer (or photos without WebGL) on the left, configurator on the right. */
export function ProductExperience({ product }: { product: Product }) {
  const [metal, setMetal] = useState<MetalKey>(product.metal);
  const [stone, setStone] = useState<StoneKey | null>(product.stone);
  const [device, setDevice] = useState<Device | null>(null); // null until 3D may load
  const [canTap3d, setCanTap3d] = useState<Device | null>(null); // phones: 3D waits for this button
  const [ready, setReady] = useState(false);
  const [interacted, setInteracted] = useState(false); // the hint fades once the visitor has found the controls
  const api = useRef<ViewerApi | null>(null);

  useEffect(() => {
    const { lite, reduced, webgl } = deviceProfile();
    heroState.reduced = reduced; // shared "less motion" flag the 3D effects read
    if (!webgl) return;
    const d = { lite, reduced, touch: window.matchMedia("(pointer: coarse)").matches };
    // desktop loads the viewer right away; phones show the photo and load 3D on tap, keeping first load light
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only capability checks
    if (lite) setCanTap3d(d);
    else setDevice(d);
  }, []);

  const onKey = (e: KeyboardEvent) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => api.current?.rotate(-0.3),
      ArrowRight: () => api.current?.rotate(0.3),
      "+": () => api.current?.zoom(0.85),
      "=": () => api.current?.zoom(0.85),
      "-": () => api.current?.zoom(1.18),
    };
    if (!actions[e.key]) return;
    e.preventDefault();
    setInteracted(true);
    actions[e.key]();
  };

  const metalLabel = METALS[metal].label;
  const stoneLabel = stone ? STONES[stone].label : null;
  const summary = [metalLabel, stoneLabel].filter(Boolean).join(", ");
  const details = [
    ["Metal", metalLabel],
    ["Stone", stoneLabel ?? "None"],
    ...(product.carat ? [["Carat", `${product.carat} ct`]] : []),
  ];

  return (
    <main id="main" className="grid gap-12 px-6 pb-32 pt-24 md:grid-cols-[1.3fr_1fr] md:gap-20 md:px-12 md:pt-32">
      <div className="grid gap-4">
        {/* 3D viewer; the photo underneath is the poster while it loads and the fallback without WebGL */}
        <div
          role="group"
          tabIndex={device ? 0 : -1}
          onKeyDown={onKey}
          onPointerDown={() => ready && setInteracted(true)}
          aria-label={`3D view of the ${product.name} in ${summary}. Arrow keys turn it, plus and minus zoom.`}
          className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#1d1a15,#0e0d0b_70%)] md:aspect-square"
        >
          <Image
            src={productImage(product)}
            alt={`${product.name}, ${summary}`}
            fill
            preload
            fetchPriority="high"
            sizes="(min-width: 768px) 55vw, 100vw"
            className={`object-contain p-[8%] transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`}
          />
          {device && (
            <div className={`absolute inset-0 cursor-grab transition-opacity duration-[1200ms] active:cursor-grabbing ${ready ? "opacity-100" : "opacity-0"}`}>
              <ProductViewer
                metal={metal}
                stone={stone}
                model={product.model}
                lite={device.lite}
                reduced={device.reduced}
                touch={device.touch}
                apiRef={api}
                onReady={() => setReady(true)}
              />
            </div>
          )}
          {canTap3d && !device && (
            <button
              type="button"
              onClick={() => setDevice(canTap3d)}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 border border-gold/70 bg-ink/60 px-6 py-3 text-xs uppercase tracking-[0.3em] text-gold backdrop-blur-sm"
            >
              View in 3D
            </button>
          )}
        </div>

        {/* controls sit under the frame, never over the ring */}
        {device && (
          <div className="flex min-h-11 items-center justify-between gap-4">
            <p
              aria-live="polite"
              className={`min-w-0 truncate text-xs uppercase tracking-[0.12em] text-stone transition-opacity duration-700 md:tracking-[0.25em] ${ready && interacted ? "opacity-0" : "opacity-100"}`}
            >
              {ready ? `Drag to turn · ${device.touch ? "Pinch" : "⌘/Ctrl + scroll"} to zoom` : "Loading 3D…"}
            </p>
            <div className="flex shrink-0 gap-2">
              {(
                [
                  ["Zoom in", "+", 0.85],
                  ["Zoom out", "−", 1.18],
                ] as const
              ).map(([label, glyph, factor]) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  disabled={!ready}
                  onClick={() => {
                    setInteracted(true);
                    api.current?.zoom(factor);
                  }}
                  className="flex h-11 w-11 items-center justify-center border border-gold/50 text-lg font-light text-gold transition-colors duration-500 hover:border-gold hover:bg-gold hover:text-ink disabled:opacity-40"
                >
                  {glyph}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative aspect-[4/5] bg-[radial-gradient(ellipse_at_50%_40%,#1d1a15,#0e0d0b_70%)] md:aspect-square">
          <Image src={productImage(product, "detail")} alt={`${product.name}, detail`} fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
        </div>
      </div>

      <div className="md:sticky md:top-32 md:self-start">
        <RevealText as="h1" text={product.name} className="block font-serif text-5xl font-light leading-tight md:text-6xl" />
        <p className="mt-4 text-lg tabular-nums text-ivory/85">{formatPrice(product.price)}</p>
        <p className="mt-8 max-w-md leading-relaxed text-ivory/70">{product.description}</p>

        <fieldset className="mt-10">
          <legend className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">
            Metal <span className="ml-2 normal-case tracking-normal text-ivory/80">{metalLabel}</span>
          </legend>
          <div className="flex gap-3">
            {(Object.keys(METALS) as MetalKey[]).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={m === metal}
                aria-label={METALS[m].label}
                onClick={() => setMetal(m)}
                className={`h-10 w-10 rounded-full border p-[3px] transition-colors duration-500 ${m === metal ? "border-gold" : "border-transparent hover:border-line"}`}
              >
                {/* a little highlight so each swatch reads as polished metal */}
                <span
                  className="block h-full w-full rounded-full"
                  style={{ background: `radial-gradient(circle at 30% 30%, #fff8, transparent 45%), ${METALS[m].color}` }}
                />
              </button>
            ))}
          </div>
        </fieldset>

        {product.stone && (
          <fieldset className="mt-8">
            <legend className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">Stone</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STONES) as StoneKey[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={s === stone}
                  onClick={() => setStone(s)}
                  className={`border px-4 py-2 text-xs uppercase tracking-[0.25em] transition-colors duration-500 ${s === stone ? "border-gold/70 text-gold" : "border-line text-ivory/60 hover:text-ivory"}`}
                >
                  {STONES[s].label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <dl className="mt-10 grid max-w-md grid-cols-[auto_1fr] gap-x-10 gap-y-3 border-t border-line pt-6 text-sm">
          {details.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-xs uppercase tracking-[0.3em] text-stone">{k}</dt>
              <dd className="text-ivory/85">{v}</dd>
            </div>
          ))}
        </dl>

        <MagneticButton className="mt-10">
          <a
            href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Enquiry: ${product.name} (${summary})`)}`}
            className="block border border-gold/70 px-9 py-4 text-xs uppercase tracking-[0.35em] text-gold transition-colors duration-700 hover:bg-gold hover:text-ink"
          >
            Enquire about this piece
          </a>
        </MagneticButton>
      </div>
    </main>
  );
}
