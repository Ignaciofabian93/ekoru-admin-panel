"use client";

import { INK } from "./theme";

/** A legend entry: a short line for lines, a square for bars and areas. */
export function LegendKey({
  color,
  label,
  shape,
}: {
  color: string;
  label: string;
  shape: "line" | "square";
}) {
  return (
    <span className="flex items-center gap-1.5 font-sans text-xs text-foreground-secondary">
      {shape === "line" ? (
        <span className="h-0.5 w-3 rounded-full" style={{ backgroundColor: color }} />
      ) : (
        <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
      )}
      {label}
    </span>
  );
}

export type TooltipRow = { key: string; color: string; label: string; value: string };

/**
 * The hover readout, beside the crosshair or the hovered column, flipped to the
 * left near the right edge. Values lead in strong ink; series follow, keyed by
 * a short stroke of their color.
 */
export function ChartTooltip({
  x,
  width,
  title,
  rows,
  footer,
}: {
  x: number;
  width: number;
  title: string;
  rows: TooltipRow[];
  footer?: TooltipRow;
}) {
  const flip = x > width * 0.6;
  return (
    <div
      role="status"
      className="pointer-events-none absolute top-0 z-(--z-raised) flex min-w-36 flex-col gap-1 rounded-md border border-border-light bg-surface px-3 py-2 font-sans text-xs shadow-md"
      style={flip ? { right: width - x + 12 } : { left: x + 12 }}
    >
      <span style={{ color: INK.muted }}>{title}</span>
      {rows.map((r) => (
        <span key={r.key} className="flex items-center gap-2">
          <span
            className="h-0.5 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: r.color }}
          />
          <span className="font-semibold tabular-nums" style={{ color: INK.primary }}>
            {r.value}
          </span>
          <span style={{ color: INK.secondary }}>{r.label}</span>
        </span>
      ))}
      {footer && (
        <span className="flex items-center gap-2 border-t border-border-light pt-1">
          <span className="font-semibold tabular-nums" style={{ color: INK.primary }}>
            {footer.value}
          </span>
          <span style={{ color: INK.secondary }}>{footer.label}</span>
        </span>
      )}
    </div>
  );
}
