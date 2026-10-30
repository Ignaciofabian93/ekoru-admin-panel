"use client";

import { useState } from "react";
import { niceTicks } from "./format";
import { INK, SERIES } from "./theme";
import { useWidth } from "./useWidth";
import { ChartTooltip, LegendKey } from "./parts";

export type ChartSeries = { key: string; label: string; values: number[] };

const M = { top: 8, right: 12, bottom: 24, left: 60 };

/**
 * Lines over time on one axis (never two scales). A crosshair follows the
 * pointer or the arrow keys and the tooltip lists every series at that point.
 * One series gets a light area wash and no legend: the card title names it.
 */
export function LineChart({
  labels,
  series,
  format,
  formatAxis,
  height = 220,
  ariaLabel,
}: {
  labels: string[];
  series: ChartSeries[];
  format: (v: number) => string;
  formatAxis: (v: number) => string;
  height?: number;
  ariaLabel: string;
}) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);

  const n = labels.length;
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = height - M.top - M.bottom;
  const ticks = niceTicks(Math.max(0, ...series.flatMap((s) => s.values)));
  const yMax = ticks[ticks.length - 1];
  const x = (i: number) => M.left + (n <= 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const y = (v: number) => M.top + plotH - (v / yMax) * plotH;

  const pathOf = (values: number[]) =>
    values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");

  const indexAt = (clientX: number, rect: DOMRect) => {
    const px = clientX - rect.left - M.left;
    const i = n <= 1 ? 0 : Math.round((px / plotW) * (n - 1));
    return Math.min(n - 1, Math.max(0, i));
  };

  return (
    <div className="flex flex-col gap-2">
      {series.length > 1 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {series.map((s, i) => (
            <LegendKey key={s.key} color={SERIES[i]} label={s.label} shape="line" />
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
            onPointerMove={(e) =>
              setActive(indexAt(e.clientX, e.currentTarget.getBoundingClientRect()))
            }
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
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke={tick === 0 ? INK.axis : INK.grid}
                  strokeWidth={1}
                />
                <text
                  x={M.left - 8}
                  y={y(tick)}
                  dy="0.32em"
                  textAnchor="end"
                  fontSize={11}
                  fill={INK.muted}
                  className="tabular-nums"
                >
                  {formatAxis(tick)}
                </text>
              </g>
            ))}

            {axisIndices(n, plotW).map((i) => (
              <text
                key={i}
                x={x(i)}
                y={height - 6}
                textAnchor={
                  n > 1 && i === 0 ? "start" : n > 1 && i === n - 1 ? "end" : "middle"
                }
                fontSize={11}
                fill={INK.muted}
              >
                {labels[i]}
              </text>
            ))}

            {series.length === 1 && (
              <path
                d={`${pathOf(series[0].values)} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`}
                fill={SERIES[0]}
                fillOpacity={0.1}
              />
            )}
            {series.map((s, i) => (
              <path
                key={s.key}
                d={pathOf(s.values)}
                fill="none"
                stroke={SERIES[i]}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {active !== null && (
              <line
                x1={x(active)}
                x2={x(active)}
                y1={M.top}
                y2={M.top + plotH}
                stroke={INK.axis}
                strokeWidth={1}
              />
            )}
            {series.map((s, i) => {
              const at = active ?? n - 1;
              return (
                <circle
                  key={s.key}
                  cx={x(at)}
                  cy={y(s.values[at] ?? 0)}
                  r={4}
                  fill={SERIES[i]}
                  stroke={INK.surface}
                  strokeWidth={2}
                />
              );
            })}
          </svg>
        )}
        {active !== null && (
          <ChartTooltip
            x={x(active)}
            width={width}
            title={labels[active]}
            rows={series.map((s, i) => ({
              key: s.key,
              color: SERIES[i],
              label: s.label,
              value: format(s.values[active] ?? 0),
            }))}
          />
        )}
      </div>
    </div>
  );
}

/** At most ~6 x labels, evenly spread, always the first and the last. */
export function axisIndices(n: number, plotW: number): number[] {
  if (n <= 0) return [];
  const fit = Math.max(2, Math.min(6, Math.floor(plotW / 70)));
  if (n <= fit) return Array.from({ length: n }, (_, i) => i);
  const step = (n - 1) / (fit - 1);
  return Array.from({ length: fit }, (_, i) => Math.round(i * step));
}
