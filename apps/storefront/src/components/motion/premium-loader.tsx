"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { siteConfig } from "@likiya/config";

const SESSION_KEY = "likiya:loader-shown";

/**
 * Full-screen wordmark reveal shown once per browser session (not on every
 * client-side navigation) — `sessionStorage` rather than a route check,
 * since App Router navigations don't remount this component anyway.
 */
export function PremiumLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SESSION_KEY)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.sessionStorage.setItem(SESSION_KEY, "1");
      return;
    }

    setVisible(true);
    window.sessionStorage.setItem(SESSION_KEY, "1");
    const timer = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="section-ink fixed inset-0 z-100 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.76, 0, 0.24, 1] } }}
        >
          <motion.span
            className="font-display text-2xl font-black uppercase tracking-[0.3em]"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          >
            {siteConfig.name}
          </motion.span>
          <motion.div
            className="absolute bottom-10 left-1/2 h-px w-24 -translate-x-1/2 bg-brand-pink"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
