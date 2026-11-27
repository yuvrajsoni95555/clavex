"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { METALS, STONES } from "@/config/materials";
import { formatPrice, productImage, type Product } from "@/data/products";
import { ease } from "@/config/motion";

/**
 * Product tile: tilts toward the pointer, the photo slowly zooms and cross-fades to the detail shot,
 * and a band of gold light sweeps across once on hover. The custom cursor shows "View".
 */
export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const tilt = useRef<HTMLDivElement>(null);
  // the hover shot is fetched on first hover/focus, not on page load, so it never competes with the first paint
  const [wantDetail, setWantDetail] = useState(false);
  const [detailReady, setDetailReady] = useState(false);

  useEffect(() => {
    const el = tilt.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: ease.out });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: ease.out });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      ry(((e.clientX - r.left) / r.width - 0.5) * 8);
      rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
    };
    const leave = () => (rx(0), ry(0));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const material = [METALS[product.metal].label, product.stone && STONES[product.stone].label].filter(Boolean).join(" · ");

  return (
    <TransitionLink
      href={`/products/${product.slug}`}
      data-cursor="View"
      onPointerEnter={() => setWantDetail(true)}
      onFocus={() => setWantDetail(true)}
      className="group block [perspective:1200px]"
    >
      <div ref={tilt} className="relative aspect-[4/5] overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#1d1a15,#0e0d0b_70%)] will-change-transform">
        <Image
          src={productImage(product)}
          alt={`${product.name}, ${material}`}
          fill
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          sizes="(min-width: 768px) 33vw, 90vw"
          className={`object-contain p-[8%] transition-[transform,opacity] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 ${detailReady ? "group-hover:opacity-0" : ""}`}
        />
        {wantDetail && (
          <Image
            src={productImage(product, "detail")}
            alt=""
            fill
            sizes="(min-width: 768px) 33vw, 90vw"
            onLoad={() => setDetailReady(true)}
            className="scale-110 object-cover opacity-0 transition-[transform,opacity] duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        {/* gold shimmer: a soft diagonal band that crosses the card once per hover */}
        <div aria-hidden="true" className="clx-shimmer pointer-events-none absolute inset-0" />
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-2xl font-light">{product.name}</h3>
        <p className="shrink-0 text-sm text-ivory/80 tabular-nums">{formatPrice(product.price)}</p>
      </div>
      <p className="mt-1 text-xs uppercase tracking-[0.25em] text-stone">{material}</p>
    </TransitionLink>
  );
}
