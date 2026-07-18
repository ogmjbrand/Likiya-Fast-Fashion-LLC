/**
 * Maps common color-option value names to a swatch color. Product data
 * stores colors as free-text option values (e.g. "Black", "Tan") rather
 * than hex codes, so this is a best-effort lookup for rendering an actual
 * swatch — unmapped names fall back to a plain text button instead of a
 * blank/wrong-colored circle.
 */
const COLOR_SWATCHES: Record<string, string> = {
  black: "#0a0a0a",
  white: "#ffffff",
  ivory: "#f5f0e6",
  cream: "#f2e8d5",
  beige: "#e8dcc8",
  tan: "#c8a978",
  camel: "#c19a6b",
  brown: "#5c4030",
  chocolate: "#3d2b1f",
  navy: "#1b2a4a",
  blue: "#3b5b92",
  "light blue": "#a7c4dd",
  denim: "#4a6b8a",
  red: "#b3312c",
  burgundy: "#6b1f2a",
  maroon: "#5c1a24",
  pink: "#e8a0b4",
  blush: "#f0c4cf",
  rose: "#c46b7e",
  green: "#4a6741",
  olive: "#6b6b47",
  sage: "#9caf88",
  emerald: "#0f5c4a",
  yellow: "#e8c547",
  mustard: "#c9a227",
  gold: "#c9a24a",
  orange: "#d17a3e",
  rust: "#a35a3a",
  purple: "#5e4b8b",
  lavender: "#c3b1e1",
  grey: "#8a8a8a",
  gray: "#8a8a8a",
  charcoal: "#3a3a3a",
  silver: "#c0c0c0",
  multi: "linear-gradient(135deg, #b3312c 0%, #c9a227 33%, #4a6741 66%, #3b5b92 100%)",
};

export function getColorSwatch(value: string): string | null {
  return COLOR_SWATCHES[value.trim().toLowerCase()] ?? null;
}

export function isColorOption(optionName: string): boolean {
  return optionName.trim().toLowerCase() === "color";
}
