import { TransitionLink } from "@/components/motion/TransitionLink";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.5em] text-gold">404</p>
      <h1 className="mt-6 font-serif text-5xl font-light md:text-7xl">This piece isn&rsquo;t here</h1>
      <p className="mt-6 max-w-sm text-ivory/70">The page may have moved, or the piece is no longer in the collection.</p>
      <TransitionLink href="/collections" className="mt-10 border-b border-gold/60 pb-2 text-xs uppercase tracking-[0.35em] text-gold">
        Browse the collection
      </TransitionLink>
    </main>
  );
}
