"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Next.js remounts `template.tsx` on every navigation within this segment
 * (unlike `layout.tsx`, which persists) — that gives each page entrance a
 * fresh mount to animate in on. App Router doesn't support animating the
 * *outgoing* page's exit without a custom router shim, so this is
 * deliberately entrance-only rather than a full crossfade.
 */
export default function StorefrontTemplate({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, clipPath: "inset(4% 0% 4% 0%)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
