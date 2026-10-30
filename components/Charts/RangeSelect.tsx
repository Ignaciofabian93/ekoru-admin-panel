"use client";

import clsx from "clsx";
import { useTranslation } from "@/i18n/context";

export const ANALYTICS_RANGES = [
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "LAST_90_DAYS",
  "LAST_12_MONTHS",
] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

/** The period picker, one row above everything it scopes. */
export function RangeSelect({
  value,
  onChange,
}: {
  value: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
}) {
  const { t } = useTranslation("charts");
  return (
    <div
      role="radiogroup"
      aria-label={t("range.label")}
      className="inline-flex self-start rounded-md border border-border-strong bg-surface p-0.5 sm:self-auto"
    >
      {ANALYTICS_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          role="radio"
          aria-checked={value === range}
          onClick={() => onChange(range)}
          className={clsx(
            "rounded-sm px-3 py-1.5 font-sans text-sm transition-colors",
            value === range
              ? "bg-primary font-semibold text-on-primary"
              : "text-foreground-secondary hover:bg-surface-hover",
          )}
        >
          {t(`range.${range}`)}
        </button>
      ))}
    </div>
  );
}
