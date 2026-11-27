import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { cssVars } from "@/config/theme";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Preloader } from "@/components/motion/Preloader";
import { CustomCursor } from "@/components/motion/CustomCursor";
import { PageTransition } from "@/components/motion/PageTransition";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/config/site";
import { asset } from "@/lib/asset";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: "300", // the site only uses the light cut; each extra weight is another font file on the critical path
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // set NEXT_PUBLIC_SITE_URL to the live domain (e.g. on Vercel) so share images get absolute URLs
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "CLAVEX — Fine Jewellery",
    template: "%s · CLAVEX",
  },
  description: SITE.description,
  // each page sets its own canonical URL; a canonical here would point every page at the home page
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_IN",
    images: [{ url: asset("/products/editorial-aurelia.webp"), width: 1600, height: 1000, alt: "CLAVEX solitaire ring, close-up of the setting" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`} style={cssVars}>
      <body className="min-h-screen">
        {/* without JavaScript the preloader would never lift */}
        <noscript>
          <style>{"#clx-preloader{display:none}[data-reveal] .clx-part{transform:none!important}[data-reveal-img]{clip-path:none!important}"}</style>
        </noscript>
        {/* SmoothScroll must mount before Preloader so it hears the preloader's scroll-lock */}
        <SmoothScroll />
        <Preloader />
        <CustomCursor />
        <PageTransition />
        <a
          href="#main"
          className="sr-only z-[100] bg-gold px-4 py-2 text-xs uppercase tracking-[0.3em] text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
