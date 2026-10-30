"use client";

import {
  BarList,
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
} from "@/components/Charts";
import { Text } from "@/components/Text/Text";
import type { SupportedLanguage } from "@/constants/settings";
import { useTranslation } from "@/i18n/context";
import { usePlatformAnalytics } from "../hooks/useAnalytics";
import { useAnalyticsRange } from "../hooks/useAnalyticsRange";
import type { PlatformPoint, PlatformTotals } from "../types";
import { AnalyticsFrame, PrivacyNote } from "./AnalyticsFrame";

/** Completed transactions by kind: each kind keeps its series slot. */
const KINDS = [
  ["STORE_ORDER", "storeOrders"],
  ["SERVICE_QUOTE", "serviceQuotes"],
  ["SERVICE_BOOKING", "serviceBookings"],
  ["MARKETPLACE_SALE", "marketplaceSales"],
  ["EXCHANGE", "exchanges"],
  ["MEMBERSHIP", "memberships"],
] as const satisfies readonly (readonly [string, keyof PlatformPoint])[];

const SELLER_TYPES = [
  ["PERSON", "newPersons"],
  ["STARTUP", "newStartups"],
  ["COMPANY", "newCompanies"],
] as const satisfies readonly (readonly [string, keyof PlatformPoint])[];

/**
 * EKORU's home dashboard for platform admins with VIEW_ANALYTICS: totals across
 * every user, never one business's figures (ekoru-search refuses those to
 * platform admins).
 */
export function PlatformDashboard({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("analytics");
  const { t: tc } = useTranslation("charts");
  const { range, setRange } = useAnalyticsRange();
  const { data, loading, error } = usePlatformAnalytics(range, lang);

  const count = (v: number) => formatCount(v, lang);
  const countAxis = (v: number) => formatCount(v, lang, true);
  const clp = (v: number) => formatClp(v, lang);
  const clpAxis = (v: number) => formatClp(v, lang, true);

  const tile = (
    key: string,
    pick: (x: PlatformTotals) => number,
    show: (v: number) => string,
    opts: { upIsGood?: boolean; hint?: string } = {},
  ) => {
    if (!data) return null;
    const delta = change(pick(data.current), pick(data.previous));
    return (
      <StatTile
        key={key}
        label={t(`platform.kpis.${key}`)}
        value={show(pick(data.current))}
        delta={delta}
        deltaLabel={delta == null ? undefined : formatChange(delta, lang)}
        upIsGood={opts.upIsGood}
        hint={opts.hint}
      />
    );
  };

  const bucket = data ? t(`buckets.${data.period.bucket}`) : "";
  const labels = data
    ? data.series.map((p) => bucketLabel(p.bucket, data.period.bucket, lang))
    : [];
  const fullLabels = data ? data.series.map((p) => p.bucket) : [];

  return (
    <AnalyticsFrame
      title={t("platform.title")}
      subtitle={t("platform.subtitle")}
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
              {
                hint: t("platform.kpis.grossSalesHint"),
              },
            )}
            {tile(
              "revenue",
              (x) => x.revenue,
              (v) => formatMoneyFigure(v, lang),
              {
                hint: t("platform.kpis.revenueHint"),
              },
            )}
            {tile("payments", (x) => x.payments, count)}
            {tile(
              "averageTicket",
              (x) => x.averageTicket,
              (v) => formatMoneyFigure(v, lang),
            )}
            {tile(
              "refunded",
              (x) => x.refunded,
              (v) => formatMoneyFigure(v, lang),
              {
                upIsGood: false,
              },
            )}
            {tile("newSellers", (x) => x.newSellers, count)}
            {tile(
              "co2",
              (x) => x.co2SavedKg,
              (v) => formatAmount(v, t("common.kg"), lang),
            )}
            {tile("views", (x) => x.views, count)}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard
              className="lg:col-span-2"
              title={t("platform.charts.sales.title")}
              subtitle={t("platform.charts.sales.subtitle", { bucket })}
              busy={loading}
              table={{
                head: ["", t("platform.kpis.grossSales"), t("platform.kpis.revenue")],
                rows: data.series.map((p, i) => [
                  fullLabels[i],
                  clp(p.grossSales),
                  clp(p.revenue),
                ]),
              }}
            >
              <LineChart
                ariaLabel={t("platform.charts.sales.title")}
                labels={labels}
                series={[
                  {
                    key: "grossSales",
                    label: t("platform.kpis.grossSales"),
                    values: data.series.map((p) => p.grossSales),
                  },
                  {
                    key: "revenue",
                    label: t("platform.kpis.revenue"),
                    values: data.series.map((p) => p.revenue),
                  },
                ]}
                format={clp}
                formatAxis={clpAxis}
              />
            </ChartCard>

            <ChartCard
              title={t("platform.charts.kinds.title")}
              subtitle={t("platform.charts.kinds.subtitle", { bucket })}
              busy={loading}
              table={{
                head: ["", tc("total"), t("platform.kpis.grossSales")],
                rows: data.transactionsByKind.map((k) => [
                  t(`platform.kinds.${k.key}`),
                  count(k.count),
                  k.amount ? clp(k.amount) : "—",
                ]),
              }}
            >
              <StackedColumns
                ariaLabel={t("platform.charts.kinds.title")}
                labels={labels}
                series={KINDS.map(([key, field]) => ({
                  key,
                  label: t(`platform.kinds.${key}`),
                  values: data.series.map((p) => p[field]),
                }))}
                format={countAxis}
                totalLabel={tc("total")}
              />
            </ChartCard>

            <ChartCard
              title={t("platform.charts.sellers.title")}
              subtitle={t("platform.charts.sellers.subtitle", { bucket })}
              busy={loading}
              table={{
                head: [
                  "",
                  ...SELLER_TYPES.map(([key]) => t(`platform.sellerTypes.${key}`)),
                ],
                rows: data.series.map((p, i) => [
                  fullLabels[i],
                  ...SELLER_TYPES.map(([, field]) => count(p[field])),
                ]),
              }}
            >
              <StackedColumns
                ariaLabel={t("platform.charts.sellers.title")}
                labels={labels}
                series={SELLER_TYPES.map(([key, field]) => ({
                  key,
                  label: t(`platform.sellerTypes.${key}`),
                  values: data.series.map((p) => p[field]),
                }))}
                format={countAxis}
                totalLabel={tc("total")}
              />
            </ChartCard>

            <ChartCard
              title={t("platform.charts.payments.title")}
              subtitle={t("platform.charts.payments.subtitle")}
              busy={loading}
            >
              <BarList
                emptyLabel={t("common.noData")}
                items={data.paymentsByStatus.map((s) => ({
                  key: s.key,
                  label: t(`statuses.${s.key}`),
                  value: s.count,
                  display: `${count(s.count)} · ${clp(s.amount)}`,
                }))}
              />
            </ChartCard>

            <ChartCard
              title={t("platform.charts.categories.title")}
              subtitle={t("platform.charts.categories.subtitle")}
              busy={loading}
            >
              <BarList
                emptyLabel={t("common.noData")}
                items={data.topCategories.map((c) => ({
                  key: `${c.catalog}:${c.name}`,
                  label: `${c.name} · ${t(`platform.catalogs.${c.catalog}`)}`,
                  value: c.views,
                  display: t("common.views", { views: count(c.views) }),
                }))}
              />
            </ChartCard>

            <ChartCard
              title={t("platform.charts.searches.title")}
              subtitle={t("platform.charts.searches.subtitle")}
              busy={loading}
            >
              <BarList
                emptyLabel={t("common.noData")}
                items={data.topSearches.map((s) => ({
                  key: s.query,
                  label: s.query,
                  value: s.searches,
                  display: t("common.searchesAndClicks", {
                    searches: count(s.searches),
                    clicks: count(s.clicks),
                  }),
                }))}
              />
            </ChartCard>

            <ChartCard
              title={t("platform.charts.unmet.title")}
              subtitle={t("platform.charts.unmet.subtitle")}
              busy={loading}
            >
              <BarList
                emptyLabel={t("common.noData")}
                items={data.unmetSearches.map((s) => ({
                  key: s.query,
                  label: s.query,
                  value: s.searches,
                  display: t("common.searches", { searches: count(s.searches) }),
                }))}
              />
            </ChartCard>

            <ChartCard
              title={t("platform.charts.listings.title")}
              className="lg:col-span-2"
            >
              <dl className="grid grid-cols-3 gap-3">
                {(["marketplace", "store", "services"] as const).map((key) => (
                  <div key={key} className="flex flex-col gap-0.5">
                    <dt>
                      <Text variant="small" color="secondary">
                        {t(`platform.listings.${key}`)}
                      </Text>
                    </dt>
                    <dd>
                      <Text variant="span" weight="semibold" size="xl">
                        {count(data.listings[key])}
                      </Text>
                    </dd>
                  </div>
                ))}
              </dl>
            </ChartCard>
          </div>

          <PrivacyNote />
        </div>
      )}
    </AnalyticsFrame>
  );
}
