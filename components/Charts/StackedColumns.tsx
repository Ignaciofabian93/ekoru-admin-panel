"use client";

import { useState } from "react";
import { niceTicks } from "./format";
import { axisIndices, type ChartSeries } from "./LineChart";
import { ChartTooltip, LegendKey } from "./parts";
import { INK, SERIES } from "./theme";
import { useWidth } from "./useWidth";

const M = { top: 8, right: 8, bottom: 24, left: 44 };
const GAP = 2;
const RADIUS = 4;

/**
 * Columns over time, each split by series (part of a whole). Columns are at
 * most 24px wide, segments are parted by a 2px surface gap, and only the top
 * of a column is rounded. Hovering or focusing a column lists every series in
 * it, with the total.
 */
export function StackedColumns({
  labels,
  series,
  format,
  totalLabel,
  height = 220,
  ariaLabel,
}: {
  labels: string[];
  series: ChartSeries[];
  format: (v: number) => string;
  totalLabel: string;
  height?: number;
  ariaLabel: string;
}) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const n = labels.length;
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = height - M.top - M.bottom;
  const totals = labels.map((_, i) =>
    series.reduce((sum, s) => sum + (s.values[i] ?? 0), 0),
  );
  const ticks = niceTicks(Math.max(0, ...totals));
  const yMax = ticks[ticks.length - 1];
  const band = n > 0 ? plotW / n : 0;
  const barW = Math.max(2, Math.min(24, band * 0.6));
  const cx = (i: number) => M.left + band * i + band / 2;
  const h = (v: number) => (v / yMax) * plotH;
  const baseline = M.top + plotH;

  return (
    <div className="flex flex-col gap-2">
      {/* One series needs no legend: the card title names it. */}
      {series.length > 1 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s, i) => (
            <LegendKey key={s.key} color={SERIES[i]} label={s.label} shape="square" />
          ))}
        </div>
      )}
      <div ref={ref} className="relative" style={{ height }}>
        {width > 0 && n > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={ariaLabel}
            tabIndex={0}
            className="outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(n - 1)}
            onBlur={() => setActive(null)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setActive((a) => Math.max(0, (a ?? n - 1) - 1));
              if (e.key === "ArrowRight") setActive((a) => Math.min(n - 1, (a ?? 0) + 1));
            }}
          >
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={M.left}
                  x2={width - M.right}
                  y1={baseline - h(tick)}
                  y2={baseline - h(tick)}
                  stroke={tick === 0 ? INK.axis : INK.grid}
                  strokeWidth={1}
                />
                <text
                  x={M.left - 8}
                  y={baseline - h(tick)}
                  dy="0.32em"
                  textAnchor="end"
                  fontSize={11}
                  fill={INK.muted}
                  className="tabular-nums"
                >
                  {format(tick)}
                </text>
              </g>
            ))}

            {/* The last label ends at its column's edge so it never runs off the chart. */}
            {axisIndices(n, plotW).map((i) => (
              <text
                key={i}
                x={n > 1 && i === n - 1 ? cx(i) + barW / 2 : cx(i)}
                y={height - 6}
                textAnchor={n > 1 && i === n - 1 ? "end" : "middle"}
                fontSize={11}
                fill={INK.muted}
              >
                {labels[i]}
              </text>
            ))}

            {labels.map((label, i) => {
              let top = baseline;
              const segments = series
                .map((s, si) => ({ si, v: s.values[i] ?? 0 }))
                .filter((seg) => seg.v > 0);
              return (
                <g
                  key={label + i}
                  opacity={active === null || active === i ? 1 : 0.55}
                  onPointerEnter={() => setActive(i)}
                >
                  {/* The hit area is the whole band, not just the painted column. */}
                  <rect
                    x={cx(i) - band / 2}
                    y={M.top}
                    width={band}
                    height={plotH}
                    fill="transparent"
                  />
                  {segments.map((seg, k) => {
                    const full = h(seg.v);
                    const isTop = k === segments.length - 1;
                    // Every segment above the first gives up 2px to the gap below it.
                    const drawn = Math.max(1, k === 0 ? full : full - GAP);
                    const yTop = top - full;
                    top = yTop;
                    const x0 = cx(i) - barW / 2;
                    return (
                      <path
                        key={seg.si}
                        d={columnPath(
                          x0,
                          yTop,
                          barW,
                          drawn,
                          isTop ? Math.min(RADIUS, drawn) : 0,
                        )}
                        fill={SERIES[seg.si]}
                      />
                    );
                  })}
                </g>
              );
            })}
          </svg>
        )}
        {active !== null && (
          <ChartTooltip
            x={cx(active)}
            width={width}
            title={labels[active]}
            rows={series.map((s, i) => ({
              key: s.key,
              color: SERIES[i],
              label: s.label,
              value: format(s.values[active] ?? 0),
            }))}
            footer={
              series.length > 1
                ? {
                    key: "total",
                    color: INK.muted,
                    label: totalLabel,
                    value: format(totals[active]),
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

/** A column with an optionally rounded top and a square base. */
function columnPath(x: number, y: number, w: number, h: number, r: number): string {
  if (r <= 0) return `M${x},${y} h${w} v${h} h${-w} Z`;
  return [
    `M${x},${y + h}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    `H${x + w - r}`,
    `Q${x + w},${y} ${x + w},${y + r}`,
    `V${y + h}`,
    "Z",
  ].join(" ");
}
