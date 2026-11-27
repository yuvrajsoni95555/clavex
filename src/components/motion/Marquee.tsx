/**
 * Endless strip of words. Pure CSS (two copies sliding by half their width), so it costs no JS.
 * Stops for reduced-motion visitors; pauses while hovered.
 */
export function Marquee({ items, speed = 45 }: { items: string[]; speed?: number }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="flex items-center whitespace-nowrap px-8 font-serif text-4xl font-light italic text-ivory/85 md:text-6xl">
          {item}
          <span aria-hidden="true" className="ml-16 text-base not-italic text-gold">✦</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="clx-marquee overflow-hidden border-y border-line py-8 md:py-10" style={{ ["--clx-marquee-speed" as string]: `${speed}s` }}>
      <div className="clx-marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
