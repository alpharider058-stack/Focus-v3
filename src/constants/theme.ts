import "@/global.css";

/**
 * FOCUS brand palette. Dark-only, "ember" identity:
 * fire orange for action, violet for mind, green for completed.
 */
export const FOCUS = {
  bg: "#08080C",
  surface: "#111117",
  card: "#16161E",
  cardHigh: "#1D1D27",
  border: "#262631",
  text: "#F5F5F7",
  textMuted: "#A1A1AE",
  textFaint: "#7C7C8A",
  ember: "#FF5A1F",
  emberSoft: "#FF8A5B",
  violet: "#8B7CFF",
  success: "#2ED47A",
  warning: "#FFB020",
  danger: "#FF4D5E",
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
