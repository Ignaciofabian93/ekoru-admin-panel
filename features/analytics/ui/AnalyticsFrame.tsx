"use client";

import { RangeSelect, type AnalyticsRange } from "@/components/Charts";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";

/**
 * Title, subtitle and the period picker, in the one row above everything the
 * period scopes; then the figures, or why they are missing.
 */
export function AnalyticsFrame({
  title,
  subtitle,
  range,
  onRangeChange,
  ready,
  failed,
  headingLevel = "h1",
  children,
}: {
  title: string;
  subtitle: string;
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
  /** Figures to show (fresh or the previous period's while loading). */
  ready: boolean;
  /** The request failed and there is nothing to show. */
  failed: boolean;
  headingLevel?: "h1" | "h2";
  children: React.ReactNode;
}) {
  const { t } = useTranslation("analytics");
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <Title
            level={headingLevel}
            size={headingLevel === "h1" ? "h3" : "h4"}
            weight="bold"
          >
            {title}
          </Title>
          <Text variant="p" color="secondary">
            {subtitle}
          </Text>
        </div>
        <RangeSelect value={range} onChange={onRangeChange} />
      </header>
      {failed ? (
        <div className="rounded-lg border border-border-light bg-surface p-6 text-center">
          <Text variant="p" color="secondary">
            {t("common.loadError")}
          </Text>
        </div>
      ) : ready ? (
        children
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-busy>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-lg bg-background-tertiary"
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** The note under every analytics view on what the figures cannot reveal. */
export function PrivacyNote() {
  const { t } = useTranslation("analytics");
  return (
    <Text variant="small" color="tertiary">
      {t("common.privacy")}
    </Text>
  );
}
