"use client";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { METALS, type MetalKey } from "@/config/materials";
import { bezier } from "@/config/motion";
import { CATEGORY_LABEL, products, type Category } from "@/data/products";
import { ProductCard } from "@/components/ui/ProductCard";

type Filter<T extends string> = T | "all";

function Chips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: Filter<T>; label: string }[];
  value: Filter<T>;
  onChange: (v: Filter<T>) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-3 text-xs uppercase tracking-[0.3em] text-stone">{label}</span>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className="relative px-4 py-2 text-xs uppercase tracking-[0.25em] transition-colors duration-500"
          >
            {/* the gold outline glides from chip to chip */}
            {active && (
              <motion.span
                layoutId={`chip-${label}`}
                className="absolute inset-0 border border-gold/70"
                transition={{ duration: 0.6, ease: bezier.expoOut }}
              />
            )}
            <span className={active ? "text-gold" : "text-ivory/60 hover:text-ivory"}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Filterable grid: when a filter changes, cards fade out, the rest glide to their new places, new ones rise in. */
export function CollectionGrid() {
  const [category, setCategory] = useState<Filter<Category>>("all");
  const [metal, setMetal] = useState<Filter<MetalKey>>("all");
  const reduced = useReducedMotion();

  const shown = products.filter((p) => (category === "all" || p.category === category) && (metal === "all" || p.metal === metal));
  const t = { duration: reduced ? 0 : 0.8, ease: bezier.expoOut };

  return (
    <LayoutGroup>
      <div className="mb-14 flex flex-col gap-4 border-y border-line py-6 md:flex-row md:items-center md:justify-between">
        <Chips
          label="Category"
          value={category}
          onChange={setCategory}
          options={[{ value: "all", label: "All" }, ...(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))]}
        />
        <Chips
          label="Metal"
          value={metal}
          onChange={setMetal}
          options={[{ value: "all", label: "All" }, ...(Object.keys(METALS) as MetalKey[]).map((m) => ({ value: m, label: METALS[m].label }))]}
        />
      </div>

      <h2 className="sr-only">Pieces</h2>
      <p aria-live="polite" className="sr-only">
        {shown.length} pieces shown
      </p>

      <motion.ul layout className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3" transition={t}>
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((p, i) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ ...t, delay: reduced ? 0 : i * 0.04 }}
            >
              <ProductCard product={p} priority={i === 0} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {shown.length === 0 && (
        <p className="py-24 text-center font-serif text-2xl font-light italic text-stone">No pieces match these filters yet.</p>
      )}
    </LayoutGroup>
  );
}
