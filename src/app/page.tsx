import { Hero } from "@/components/sections/Hero";
import { ScrollStory } from "@/components/sections/ScrollStory";
import { Marquee } from "@/components/motion/Marquee";
import { RevealText } from "@/components/motion/RevealText";
import { RevealImage } from "@/components/motion/RevealImage";
import { Counter } from "@/components/motion/Counter";
import { GoldDust } from "@/components/motion/GoldDust";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { ProductCard } from "@/components/ui/ProductCard";
import { products } from "@/data/products";

const featured = ["aurelia-solitaire", "rose-lumiere", "nuit-saphir"].map((s) => products.find((p) => p.slug === s)!);

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <ScrollStory />

      <Marquee items={["Fine Jewellery", "Certified Diamonds", "Lab-Grown", "Handcrafted"]} />

      {/* featured pieces */}
      <section id="collections" className="px-6 py-28 md:px-12 md:py-40">
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.5em] text-gold">The collection</p>
            <RevealText
              as="h2"
              text="Pieces to keep for a lifetime"
              by="words"
              trigger="scroll"
              className="max-w-xl font-serif text-4xl font-light leading-tight md:text-6xl"
            />
          </div>
          <MagneticButton>
            <TransitionLink href="/collections" className="block border-b border-gold/60 pb-2 text-xs uppercase tracking-[0.35em] text-gold">
              View all pieces
            </TransitionLink>
          </MagneticButton>
        </div>
        <div className="grid gap-x-6 gap-y-16 md:grid-cols-3">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* editorial: each image drifts inside its mask while the copy sits beside it */}
      <section className="grid items-center gap-12 px-6 pb-28 md:grid-cols-[1.4fr_1fr] md:gap-20 md:px-12 md:pb-40">
        <RevealImage
          src="/products/editorial-aurelia.webp"
          alt="Close-up of the Aurelia Solitaire's six claws holding a round brilliant diamond"
          aspect="16/10"
          parallax
          sizes="(min-width: 768px) 58vw, 100vw"
          frameClassName="bg-[radial-gradient(ellipse_at_55%_45%,#221d16,#0e0d0b_75%)]"
          className="object-cover"
        />
        <div>
          <p className="mb-5 text-xs uppercase tracking-[0.5em] text-gold">The setting</p>
          <RevealText as="h2" text="Six claws, set by hand" by="words" trigger="scroll" className="font-serif text-4xl font-light leading-tight md:text-5xl" />
          <p className="mt-6 max-w-md leading-relaxed text-ivory/70">
            Each claw is shaped to hold the stone high, so light can enter from every side and leave as fire.
          </p>
        </div>
      </section>

      <section className="grid items-center gap-12 px-6 pb-28 md:grid-cols-[1fr_1.4fr] md:gap-20 md:px-12 md:pb-40">
        <div>
          <p className="mb-5 text-xs uppercase tracking-[0.5em] text-gold">Lab-grown</p>
          <RevealText
            as="h2"
            text="The same fire, grown above ground"
            by="words"
            trigger="scroll"
            className="font-serif text-4xl font-light leading-tight md:text-5xl"
          />
          <p className="mt-6 max-w-md leading-relaxed text-ivory/70">
            A lab-grown diamond is carbon, cut and polished like any other. You see the difference only in the price.
          </p>
        </div>
        <RevealImage
          src="/products/editorial-rose.webp"
          alt="A lab-grown brilliant set in rose gold"
          aspect="16/10"
          parallax
          sizes="(min-width: 768px) 58vw, 100vw"
          frameClassName="bg-[radial-gradient(ellipse_at_55%_45%,#241a17,#0e0d0b_75%)]"
          className="object-cover"
        />
      </section>

      {/* numbers, with gold dust drifting behind */}
      <section className="relative overflow-hidden border-t border-line px-6 py-28 md:py-36">
        <GoldDust />
        {/* placeholder figures: replace with CLAVEX's real numbers before launch */}
        <div className="relative mx-auto grid max-w-5xl gap-16 md:grid-cols-3">
          <Counter value={25} suffix="+" label="Years at the bench" />
          <Counter value={12000} suffix="+" label="Pieces delivered" />
          <Counter value={100} suffix="%" label="Certified stones" />
        </div>
      </section>
    </main>
  );
}
