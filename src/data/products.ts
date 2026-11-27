import type { MetalKey, StoneKey } from "@/config/materials";

/**
 * The catalogue. Placeholder pieces and prices: replace with your own.
 * Images live in /public/products/<slug>.webp (+ -detail.webp for the hover shot).
 * The current images are renders of the procedural ring; swap in real photography with the same names.
 * `model` (optional): a .glb in /public/models/ for the 3D viewer on the product page.
 */
export type Category = "engagement" | "bands";

export type Product = {
  slug: string;
  name: string;
  category: Category;
  metal: MetalKey;
  stone: StoneKey | null;
  /** INR, whole rupees */
  price: number;
  carat?: number;
  description: string;
  model?: string;
};

export const CATEGORY_LABEL: Record<Category, string> = {
  engagement: "Engagement",
  bands: "Bands",
};

export const products: Product[] = [
  {
    slug: "aurelia-solitaire",
    name: "Aurelia Solitaire",
    category: "engagement",
    metal: "yellow",
    stone: "diamond",
    price: 185000,
    carat: 1,
    description: "A single round brilliant held high in six slender claws, on a softly domed 18k yellow gold band.",
  },
  {
    slug: "rose-lumiere",
    name: "Rosé Lumière",
    category: "engagement",
    metal: "rose",
    stone: "labgrown",
    price: 96000,
    carat: 1.2,
    description: "A lab-grown brilliant set in warm 18k rose gold. All the fire, grown above ground.",
  },
  {
    slug: "etoile-blanche",
    name: "Étoile Blanche",
    category: "engagement",
    metal: "white",
    stone: "diamond",
    price: 212000,
    carat: 1.1,
    description: "Bright white gold, rhodium-finished, so the stone reads even whiter.",
    // example of the .glb pipeline: this page loads public/models/sample-solitaire.glb instead of the procedural ring
    model: "/models/sample-solitaire.glb",
  },
  {
    slug: "lune-dargent",
    name: "Lune d'Argent",
    category: "engagement",
    metal: "silver",
    stone: "labgrown",
    price: 42000,
    carat: 0.8,
    description: "Sterling silver and a lab-grown stone: our most approachable solitaire.",
  },
  {
    slug: "verde-solitaire",
    name: "Verde Solitaire",
    category: "engagement",
    metal: "yellow",
    stone: "emerald",
    price: 138000,
    carat: 1,
    description: "A deep green emerald in yellow gold, for a ring that is entirely yours.",
  },
  {
    slug: "nuit-saphir",
    name: "Nuit Saphir",
    category: "engagement",
    metal: "white",
    stone: "sapphire",
    price: 154000,
    carat: 1,
    description: "A midnight-blue sapphire set in white gold.",
  },
  {
    slug: "classic-band-or",
    name: "Classic Band, Or",
    category: "bands",
    metal: "yellow",
    stone: null,
    price: 58000,
    description: "A comfort-fit wedding band in 18k yellow gold, polished to a mirror.",
  },
  {
    slug: "classic-band-rose",
    name: "Classic Band, Rosé",
    category: "bands",
    metal: "rose",
    stone: null,
    price: 58000,
    description: "The same comfort-fit band, in 18k rose gold.",
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatPrice = (inr: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(inr);

export const productImage = (p: Product, view: "main" | "detail" = "main") =>
  `/products/${p.slug}${view === "detail" ? "-detail" : ""}.webp`;
