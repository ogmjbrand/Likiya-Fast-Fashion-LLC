import type { SVGProps } from "react";

/**
 * lucide-react dropped brand/social icons; these small inline SVGs cover the
 * two networks we link to instead of pulling in a full icon-pack dependency.
 */

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-3.24-1.62v9.9a5.28 5.28 0 1 1-4.53-5.23v2.2a3.08 3.08 0 1 0 2.33 2.99V2h2.2a4.28 4.28 0 0 0 3.24 3.63z" />
    </svg>
  );
}
