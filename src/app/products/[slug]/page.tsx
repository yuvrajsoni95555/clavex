import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, productImage, products } from "@/data/products";
import { ProductExperience } from "@/components/sections/ProductExperience";

// every product page is built ahead of time
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return p ? { title: p.name, description: p.description, openGraph: { images: [productImage(p)] } } : {};
}

// params are read inside <Suspense> (Cache Components rule); known slugs still prerender in full.
export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<main className="min-h-svh" />}>
      <ProductView params={params} />
    </Suspense>
  );
}

async function ProductView({ params }: Props) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  return <ProductExperience product={product} />;
}
