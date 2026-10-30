"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Receipt, Search, type LucideIcon } from "lucide-react";
import {
  ChartCard,
  LineChart,
  StackedColumns,
  StatTile,
  bucketLabel,
  change,
  formatAmount,
  formatChange,
  formatClp,
  formatCount,
  formatMoneyFigure,
  formatPercent,
  localeOf,
} from "@/components/Charts";
import { Text } from "@/components/Text/Text";
import type { SupportedLanguage } from "@/constants/settings";
import { useTranslation } from "@/i18n/context";
import { useBusinessAnalytics } from "../hooks/useAnalytics";
import { useAnalyticsRange } from "../hooks/useAnalyticsRange";
import type { BusinessTotals } from "../types";
import { AnalyticsFrame, PrivacyNote } from "./AnalyticsFrame";

const MORE: { key: "sales" | "products" | "search"; to: string; icon: LucideIcon }[] = [
  { key: "sales", to: "business-sales", icon: Receipt },
  { key: "products", to: "business-products", icon: BarChart3 },
  { key: "search", to: "business-search", icon: Search },
];

/**
 * A business's home dashboard: its own sales, payout, views and impact, for
 * its admins with VIEW_BUSINESS_ANALYTICS.
 */
export function BusinessDashboard({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("analytics");
  const { range, setRange } = useAnalyticsRange();
  const { data, loading, error } = useBusinessAnalytics(range);

  const count = (v: number) => formatCount(v, lang);
  const clp = (v: number) => formatClp(v, lang);

  const tile = (
    key: string,
    pick: (x: BusinessTotals) => number,
    show: (v: number) => string,
    hint?: string,
  ) => {
    if (!data) return null;
    const delta = change(pick(data.current), pick(data.previous));
    return (
      <StatTile
        key={key}
        label={t(`business.kpis.${key}`)}
        value={show(pick(data.current))}
        delta={delta}
        deltaLabel={delta == null ? undefined : formatChange(delta, lang)}
        hint={hint}
      />
    );
  };

  const bucket = data ? t(`buckets.${data.period.bucket}`) : "";
  const labels = data
    ? data.series.map((p) => bucketLabel(p.bucket, data.period.bucket, lang))
    : [];

  return (
    <AnalyticsFrame
      title={t("business.title")}
      subtitle={t("business.subtitle")}
      range={range}
      onRangeChange={setRange}
      ready={data !== null}
      failed={!!error && data === null}
      headingLevel="h2"
    >
      {data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tile(
              "grossSales",
              (x) => x.grossSales,
              (v) => formatMoneyFigure(v, lang),
            )}
            {tile(
              "netPayout",
              (x) => x.netPayout,
              (v) => formatMoneyFigure(v, lang),
              t("business.kpis.netPayoutHint"),
            )}
            {tile(
              "sales",
              (x) => x.orders + x.paidQuotes,
              count,
              t("business.kpis.salesHint"),
            )}
            {tile(
              "averageTicket",
              (x) => x.averageTicket,
              (v) => formatMoneyFigure(v, lang),
            )}
            {tile("views", (x) => x.views, count)}
            {tile(
              "conversion",
              (x) => x.conversionRate,
              (v) => formatPercent(v, lang),
              t("business.kpis.conversionHint"),
            )}
            {tile("likes", (x) => x.likes, count)}
            {tile("quotes", (x) => x.quotesRequested, count)}
            {tile("bookings", (x) => x.bookings, count)}
            <StatTile
              label={t("business.kpis.rating")}
              hint={t("business.kpis.ratingHint")}
              value={
                data.rating == null
                  ? t("business.kpis.noRating")
                  : `${new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: 1 }).format(data.rating)} / 5`
              }
            />
            {tile(
              "co2",
              (x) => x.co2SavedKg,
              (v) => formatAmount(v, t("common.kg"), lang),
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard
              className="lg:col-span-2"
              title={t("business.charts.sales.title")}
              subtitle={t("business.charts.sales.subtitle", { bucket })}
              busy={loading}
              table={{
                head: [
                  "",
                  t("business.series.grossSales"),
                  t("business.series.netPayout"),
                ],
                rows: data.series.map((p) => [
                  p.bucket,
                  clp(p.grossSales),
                  clp(p.netPayout),
                ]),
              }}
            >
              <LineChart
                ariaLabel={t("business.charts.sales.title")}
                labels={labels}
                series={[
                  {
                    key: "grossSales",
                    label: t("business.series.grossSales"),
                    values: data.series.map((p) => p.grossSales),
                  },
                  {
                    key: "netPayout",
                    label: t("business.series.netPayout"),
                    values: data.series.map((p) => p.netPayout),
                  },
                ]}
                format={clp}
                formatAxis={(v) => formatClp(v, lang, true)}
              />
            </ChartCard>

            <ChartCard
              title={t("business.charts.views.title")}
              subtitle={t("business.charts.views.subtitle", { bucket })}
              busy={loading}
              table={{
                head: ["", t("business.series.views")],
                rows: data.series.map((p) => [p.bucket, count(p.views)]),
              }}
            >
              <LineChart
                ariaLabel={t("business.charts.views.title")}
                labels={labels}
                series={[
                  {
                    key: "views",
                    label: t("business.series.views"),
                    values: data.series.map((p) => p.views),
                  },
                ]}
                format={count}
                formatAxis={(v) => formatCount(v, lang, true)}
              />
            </ChartCard>

            <ChartCard
              title={t("business.charts.orders.title")}
              subtitle={t("business.charts.orders.subtitle", { bucket })}
              busy={loading}
              table={{
                head: ["", t("business.series.sales")],
                rows: data.series.map((p) => [p.bucket, count(p.orders)]),
              }}
            >
              <StackedColumns
                ariaLabel={t("business.charts.orders.title")}
                labels={labels}
                series={[
                  {
                    key: "orders",
                    label: t("business.series.sales"),
                    values: data.series.map((p) => p.orders),
                  },
                ]}
                format={(v) => formatCount(v, lang, true)}
                totalLabel={t("business.series.sales")}
              />
            </ChartCard>
          </div>

          <nav className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {MORE.map(({ key, to, icon: Icon }) => (
              <Link
                key={key}
                href={`/${lang}/${to}`}
                className="group flex items-start gap-3 rounded-lg border border-border-light bg-surface p-4 shadow-sm transition-colors hover:border-primary-light"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                  <Icon size={18} />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-1">
                    <Text variant="span" weight="semibold">
                      {t(`business.more.${key}`)}
                    </Text>
                    <ArrowRight
                      size={14}
                      className="text-primary transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                  <Text variant="small" color="tertiary">
                    {t(`business.more.${key}Hint`)}
                  </Text>
                </span>
              </Link>
            ))}
          </nav>

          <PrivacyNote />
        </div>
      )}
    </AnalyticsFrame>
  );
}
