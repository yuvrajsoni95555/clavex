import type { Metadata } from "next";
import { RevealText } from "@/components/motion/RevealText";
import { CollectionGrid } from "@/components/sections/CollectionGrid";

export const metadata: Metadata = {
  title: "Collections",
  description: "Engagement rings and wedding bands in gold and silver, with natural and lab-grown diamonds.",
};

export default function CollectionsPage() {
  return (
    <main id="main" className="px-6 pb-32 pt-36 md:px-12 md:pt-44">
      <p className="mb-5 text-xs uppercase tracking-[0.5em] text-gold">Collections</p>
      <RevealText as="h1" text="Fine jewellery" className="mb-16 block font-serif text-5xl font-light md:text-8xl" />
      <CollectionGrid />
    </main>
  );
}
