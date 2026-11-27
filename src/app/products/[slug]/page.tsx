import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, productImage, products } from "@/data/products";
import { asset } from "@/lib/asset";
import { ProductExperience } from "@/components/sections/ProductExperience";

// every product page is built ahead of time
export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.description,
    alternates: { canonical: asset(`/products/${p.slug}`) },
    openGraph: { type: "website", siteName: "CLAVEX", title: p.name, description: p.description, images: [{ url: productImage(p), alt: p.name }] },
  };
}

// params are read inside <Suspense>, so the page also works if Cache Components is switched back on (needs a server host).
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
