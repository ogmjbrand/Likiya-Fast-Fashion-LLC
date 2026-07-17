"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Generic scroll-triggered reveal: fades/slides/clips a block in once it
 * enters the viewport. Used for section intros, images, and copy blocks
 * where the content isn't plain text (so word-splitting isn't an option).
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "span";
}) {
  const reduceMotion = useReducedMotion();
  const MotionTag = motion[Tag];

  return (
    <MotionTag
      className={className}
      initial={reduceMotion ? undefined : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Word-by-word clip-path reveal for a single line of editorial text (hero
 * headlines, section titles). Splits on spaces - pass plain text, not JSX.
 *
 * Uses one `useInView` observer on the whole heading rather than one
 * `whileInView` per word: each word span is a tiny inline element, and an
 * observer scoped that small turned out to be unreliable once it wasn't
 * already in the initial viewport at mount (worked for the hero, which
 * mounts already visible; silently never fired for anything scrolled to
 * later - caught by actually scrolling the page in a browser, not by
 * typecheck/lint). One observer on the container, driving every word's
 * `animate` state, doesn't have that failure mode.
 */
export function TextReveal({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.05,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        // The separating space is a plain sibling text node, not content
        // inside either inline-block span: a space at the trailing edge of
        // an inline-block's own line box gets collapsed away by the usual
        // CSS whitespace-trimming rules, which silently ran every word
        // together when the space lived inside the word span instead.
        <span key={i} aria-hidden>
          <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
            <motion.span
              className={`inline-block ${wordClassName ?? ""}`}
              initial={{ y: "110%" }}
              animate={{ y: inView ? "0%" : "110%" }}
              transition={{ duration: 0.9, delay: delay + i * stagger, ease: EASE }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </span>
  );
}
