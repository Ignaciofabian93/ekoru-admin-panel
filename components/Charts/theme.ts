/**
 * Chart colors. The categorical order is the dataviz reference palette's,
 * validated on the panel's white surface (`validate_palette.js --surface
 * #ffffff`): every adjacent pair passes the colorblind and normal-vision
 * checks. Aqua, yellow and pink sit below 3:1 contrast on white, so every
 * chart keeps a legend and a table view. Assign in this order, never cycled,
 * and keep each entity on its slot whatever is filtered out.
 */
export const SERIES = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // pink
  "#008300", // green
] as const;

/** Text and chrome. Text never takes a series color. */
export const INK = {
  primary: "#1f2937",
  secondary: "#4b5563",
  muted: "#6b7280",
  grid: "#eef0f2",
  axis: "#d1d5db",
  surface: "#ffffff",
  /** Delta text: a rise that is good, or a fall that is good. */
  good: "#15803d",
  bad: "#b91c1c",
} as const;
