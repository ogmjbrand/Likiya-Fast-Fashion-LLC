"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

export interface Slideshow3DSlide {
  image: { src: string; alt?: string };
  title: string;
}

export interface Slideshow3DProps {
  slides: Slideshow3DSlide[];
  cardWidth?: number;
  cardHeight?: number;
  radius?: number;
  tilt?: number;
  sideTilt?: number;
  gap?: number;
  opacity?: number;
  transitionDuration?: number;
  transitionEase?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  autoplayDirection?: "leftToRight" | "rightToLeft";
  showTitle?: boolean;
  titleColor?: string;
  titlePosition?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  onActiveClick?: (index: number) => void;
  className?: string;
}

const PERSPECTIVE = 1600;
const SCALE_STEP = 0.16;
const MAX_VISIBLE = 2;
const DEPTH = 240;

/**
 * 3D coverflow: the active card sits upright in the spotlight while its
 * neighbours tilt back in perspective. Click a side card to bring it to
 * centre; click the centred card to fire `onActiveClick`. Pure CSS
 * transforms/transitions, no animation library.
 *
 * Adapted from a Framer marketplace component ("Smooth 3D Slideshow",
 * after Tanya Prokofieva's original) for use outside Framer's runtime —
 * the original imports `addPropertyControls`/`ControlType` from the
 * `framer` package, which only exists inside Framer's own editor/canvas
 * and has no meaning at runtime in a plain React app, so that whole
 * property-controls registration (purely for Framer's UI panel) is
 * dropped here rather than shimmed.
 */
export function Slideshow3D({
  slides,
  cardWidth = 557,
  cardHeight = 420,
  radius = 0,
  tilt = 7,
  sideTilt = 7,
  gap = 7,
  opacity = 65,
  transitionDuration = 0.6,
  transitionEase = "cubic-bezier(0.22, 1, 0.36, 1)",
  autoplay = false,
  autoplayDelay = 2.5,
  autoplayDirection = "rightToLeft",
  showTitle = true,
  titleColor = "#ffffff",
  titlePosition = "bottomLeft",
  onActiveClick,
  className,
}: Slideshow3DProps) {
  const n = slides.length;
  const [active, setActive] = useState(0);
  const lockRef = useRef(false);

  useEffect(() => {
    setActive((a) => Math.max(0, Math.min(n - 1, a)));
  }, [n]);

  const lock = useCallback(() => {
    lockRef.current = true;
    window.setTimeout(() => {
      lockRef.current = false;
    }, Math.max(50, transitionDuration * 1000));
  }, [transitionDuration]);

  const step = useCallback(
    (dir: number) => {
      if (lockRef.current || n === 0) return;
      lock();
      setActive((a) => (((a + dir) % n) + n) % n);
    },
    [n, lock],
  );

  const handleCardClick = useCallback(
    (i: number) => {
      if (lockRef.current) return;
      if (i === active) {
        onActiveClick?.(i);
        return;
      }
      lock();
      setActive(i);
    },
    [active, lock, onActiveClick],
  );

  useEffect(() => {
    if (!autoplay || n < 2) return;
    const ms = Math.max(0.3, autoplayDelay) * 1000;
    const dir = autoplayDirection === "leftToRight" ? -1 : 1;
    const id = window.setInterval(() => step(dir), ms);
    return () => window.clearInterval(id);
  }, [autoplay, autoplayDirection, autoplayDelay, n, step]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    },
    [step],
  );

  if (n === 0) return null;

  const effectiveRadius = (Math.max(0, Math.min(20, radius)) / 20) * (Math.min(cardWidth, cardHeight) / 2);
  const dim = 1 - Math.max(0, Math.min(100, opacity)) / 100;
  const transitionCss = `transform ${transitionDuration}s ${transitionEase}, opacity ${transitionDuration}s ${transitionEase}`;
  const isTop = titlePosition === "topLeft" || titlePosition === "topRight";
  const isRight = titlePosition === "topRight" || titlePosition === "bottomRight";

  const rootStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    height: "100%",
    minWidth: 320,
    minHeight: 360,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    perspective: `${PERSPECTIVE}px`,
    overflow: "hidden",
    outline: "none",
  };

  return (
    <div
      className={className}
      style={rootStyle}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      onKeyDown={onKeyDown}
    >
      <div style={{ position: "relative", width: cardWidth, height: cardHeight, transformStyle: "preserve-3d" }}>
        {slides.map((slide, i) => {
          let rel = i - active;
          if (rel > n / 2) rel -= n;
          if (rel < -n / 2) rel += n;
          const ax = Math.abs(rel);
          const visible = ax <= MAX_VISIBLE;
          const isActive = rel === 0;
          const sc = Math.max(0.4, 1 - ax * SCALE_STEP);
          const tx = rel * (gap * 30);
          const tz = -ax * DEPTH;
          const ry = -rel * tilt;
          const rz = rel * sideTilt;

          const cardStyle: CSSProperties = {
            position: "absolute",
            left: "50%",
            top: "50%",
            width: cardWidth,
            height: cardHeight,
            borderRadius: effectiveRadius,
            overflow: "hidden",
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
            transition: transitionCss,
            opacity: visible ? 1 : 0,
            cursor: isActive ? "default" : "pointer",
            pointerEvents: visible ? "auto" : "none",
            backgroundColor: "#1a1a1a",
          };

          const titleWrapStyle: CSSProperties = {
            position: "absolute",
            left: 22,
            right: 22,
            [isTop ? "top" : "bottom"]: 24,
            textAlign: isRight ? "right" : "left",
            pointerEvents: "none",
          };

          return (
            <div
              key={i}
              onClick={() => handleCardClick(i)}
              aria-label={slide.title}
              aria-hidden={!visible}
              style={cardStyle}
            >
              {slide.image?.src ? (
                // Deliberately plain: this is a portable primitive meant to accept
                // arbitrary image URLs, not just ones pre-configured in next.config's
                // image domains.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.image.src}
                  alt={slide.image.alt || slide.title || ""}
                  draggable={false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    userSelect: "none",
                  }}
                />
              ) : null}
              {showTitle ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: isTop
                        ? "linear-gradient(0deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.7) 100%)"
                        : "linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.7) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div style={titleWrapStyle}>
                    <span
                      style={{
                        color: titleColor,
                        fontSize: 28,
                        fontWeight: 700,
                        lineHeight: "1.1em",
                        letterSpacing: "-0.02em",
                        whiteSpace: "pre-line",
                        textShadow: "0 2px 10px rgba(0,0,0,0.4)",
                      }}
                    >
                      {slide.title}
                    </span>
                  </div>
                </>
              ) : null}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#000000",
                  opacity: isActive ? 0 : dim,
                  transition: `opacity ${transitionDuration}s ${transitionEase}`,
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
