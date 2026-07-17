"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { type PointerEvent, type ReactNode, useRef } from "react";

/**
 * Wraps any interactive element (button, link) and pulls it toward the
 * cursor within its bounds — the classic "magnetic button" premium micro-
 * interaction. Strength is in pixels of max travel.
 */
export function Magnetic({
  children,
  strength = 18,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    const relX = e.clientX - (bounds.left + bounds.width / 2);
    const relY = e.clientY - (bounds.top + bounds.height / 2);
    x.set((relX / (bounds.width / 2)) * strength);
    y.set((relY / (bounds.height / 2)) * strength);
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
