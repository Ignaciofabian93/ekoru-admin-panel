"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import { INK } from "./theme";

/**
 * One headline figure: its label, the value, and the change against the
 * previous period. The change is green when it went the good way (`upIsGood`
 * false for refunds and failures) and always carries an arrow, never color
 * alone.
 */
export function StatTile({
  label,
  value,
  delta,
  deltaLabel,
  upIsGood = true,
  hint,
}: {
  label: string;
  value: string;
  /** Change as a ratio (0.12 = +12%), or null when there is nothing to compare. */
  delta?: number | null;
  deltaLabel?: string;
  upIsGood?: boolean;
  hint?: string;
}) {
  const { t } = useTranslation("charts");
  const flat = delta == null || Math.abs(delta) < 0.005;
  const good = !flat && delta! > 0 === upIsGood;
  const Icon = flat ? ArrowRight : delta! > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-border-light bg-surface p-4 shadow-sm">
      <span title={hint ?? label} className="truncate">
        <Text variant="small" color="secondary">
          {label}
        </Text>
      </span>
      <Text variant="span" weight="semibold" size="2xl" className="truncate">
        {value}
      </Text>
      {delta !== undefined && (
        <span
          className="flex flex-wrap items-center gap-x-1 font-sans text-xs"
          style={{ color: flat ? INK.muted : good ? INK.good : INK.bad }}
        >
          {/* The arrow and the change stay together; the comparison wraps under them. */}
          <span className="flex items-center gap-1 whitespace-nowrap font-medium">
            <Icon size={14} aria-hidden />
            {delta == null ? t("noPrevious") : deltaLabel}
          </span>
          {delta != null && <span style={{ color: INK.muted }}>{t("vsPrevious")}</span>}
        </span>
      )}
    </div>
  );
}
