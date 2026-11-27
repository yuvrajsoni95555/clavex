import { RevealText } from "@/components/motion/RevealText";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { SITE } from "@/config/site";

export function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-line px-6 pt-24 md:px-12">
      <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl font-light leading-snug md:text-4xl">
            Visit the atelier,
            <br />
            or let us come to you.
          </p>
          <MagneticButton className="mt-8">
            <a
              href={`mailto:${SITE.email}?subject=Appointment`}
              className="block border border-gold/70 px-9 py-4 text-xs uppercase tracking-[0.35em] text-gold transition-colors duration-700 hover:bg-gold hover:text-ink"
            >
              Book an appointment
            </a>
          </MagneticButton>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-3 text-sm text-stone">
          <span className="mb-2 text-xs uppercase tracking-[0.3em] text-ivory/60">Maison</span>
          <TransitionLink href="/collections" className="transition-colors hover:text-ivory">Collections</TransitionLink>
          <TransitionLink href="/#craft" className="transition-colors hover:text-ivory">The craft</TransitionLink>
        </nav>
        <div className="flex flex-col gap-3 text-sm text-stone">
          <span className="mb-2 text-xs uppercase tracking-[0.3em] text-ivory/60">Contact</span>
          <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-ivory">{SITE.email}</a>
          {SITE.phone && (
            <a href={`tel:${SITE.phone.replace(/[^+\d]/g, "")}`} className="transition-colors hover:text-ivory">{SITE.phone}</a>
          )}
          {SITE.whatsapp && (
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ivory">
              WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* the wordmark rises letter by letter as the footer scrolls in (decorative, so hidden from screen readers) */}
      <div aria-hidden="true">
        <RevealText
          text="CLAVEX"
          trigger="scroll"
          className="mt-20 block select-none text-center font-serif text-[22vw] font-light leading-[0.75] tracking-[0.02em] text-ivory/[0.07] md:mt-28"
        />
      </div>
      <p className="flex justify-between border-t border-line py-6 text-xs tracking-[0.2em] text-stone">
        <span>© CLAVEX</span>
        <span>Fine jewellery</span>
      </p>
    </footer>
  );
}
