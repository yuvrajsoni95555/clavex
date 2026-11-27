import { TransitionLink } from "@/components/motion/TransitionLink";

const nav = [
  { href: "/collections", label: "Collections" },
  { href: "/#craft", label: "Craft" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-6 mix-blend-difference md:px-12">
      <TransitionLink href="/" className="select-none font-serif text-lg font-light tracking-[0.25em] text-ivory md:text-xl md:tracking-[0.35em]">
        CLAVEX
      </TransitionLink>
      <nav aria-label="Main" className="flex gap-4 text-xs uppercase tracking-[0.18em] text-ivory/70 md:gap-10 md:tracking-[0.3em]">
        {nav.map((n) => (
          <TransitionLink
            key={n.href}
            href={n.href}
            className={`transition-colors duration-500 hover:text-ivory ${n.href === "#contact" ? "hidden md:inline" : ""}`}
          >
            {n.label}
          </TransitionLink>
        ))}
      </nav>
    </header>
  );
}
