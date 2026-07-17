const STATEMENTS = [
  "Luxury Streetwear",
  "Modern African Elegance",
  "High Fashion",
  "Considered, Not Disposable",
];

/**
 * A continuously-scrolling brand statement strip — pure CSS keyframe
 * animation (no JS), duplicated content so the loop is seamless. Server
 * component: nothing here needs client interactivity.
 */
export function Marquee() {
  const items = [...STATEMENTS, ...STATEMENTS];

  return (
    <div className="section-ink overflow-hidden border-y border-white/10 py-4">
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-sm font-bold uppercase tracking-[0.25em]">
            {item}
            <span className="text-brand-pink" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
