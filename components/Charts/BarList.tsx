"use client";

import { Text } from "@/components/Text/Text";
import { INK, SERIES } from "./theme";

export type BarListItem = { key: string; label: string; value: number; display: string };

/**
 * Ranked horizontal bars, one series: a label, a thin bar and its value, so
 * every figure is printed and nothing needs a hover. Each bar has a rounded
 * end and a square start.
 */
export function BarList({
  items,
  emptyLabel,
}: {
  items: BarListItem[];
  emptyLabel: string;
}) {
  const max = Math.max(0, ...items.map((i) => i.value));
  if (items.length === 0 || max === 0) {
    return (
      <Text variant="small" color="tertiary" className="py-6 text-center">
        {emptyLabel}
      </Text>
    );
  }
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.key} className="flex flex-col gap-1">
          <span className="flex items-baseline justify-between gap-3 font-sans text-sm">
            <span className="truncate text-foreground" title={item.label}>
              {item.label}
            </span>
            <span
              className="shrink-0 font-medium tabular-nums"
              style={{ color: INK.primary }}
            >
              {item.display}
            </span>
          </span>
          <span
            className="h-2 w-full rounded-r-[4px]"
            style={{ backgroundColor: INK.grid }}
          >
            <span
              className="block h-2 rounded-r-[4px]"
              style={{
                width: `${Math.max(1, (item.value / max) * 100)}%`,
                backgroundColor: SERIES[0],
              }}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}
