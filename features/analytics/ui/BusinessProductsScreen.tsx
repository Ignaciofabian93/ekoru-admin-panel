"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { formatClp, formatCount, formatPercent, localeOf } from "@/components/Charts";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import Select from "@/components/Select/Select";
import type { SupportedLanguage } from "@/constants/settings";
import { useTranslation } from "@/i18n/context";
import { exportToXlsx } from "@/utils/exportXlsx";
import { useBusinessItems } from "../hooks/useAnalytics";
import { useAnalyticsRange } from "../hooks/useAnalyticsRange";
import type { ItemPerformance } from "../types";
import { AnalyticsFrame } from "./AnalyticsFrame";

const SORTS = ["views", "revenue", "unitsSold", "conversionRate", "likes"] as const;
type Sort = (typeof SORTS)[number];

/**
 * Every listing of the business with its views, likes, sales and conversion in
 * the period, sortable and exportable.
 */
export function BusinessProductsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("analytics");
  const { range, setRange } = useAnalyticsRange();
  const [sort, setSort] = useState<Sort>("views");
  const { items, loading, error } = useBusinessItems(range);

  const count = (v: number) => formatCount(v, lang);
  const rating = (v: number | null) =>
    v == null
      ? "—"
      : new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: 1 }).format(v);

  const rows = useMemo(
    () => [...(items ?? [])].sort((a, b) => b[sort] - a[sort] || b.views - a.views),
    [items, sort],
  );

  const columns: Column<ItemPerformance>[] = [
    {
      key: "name",
      header: t("products.fields.name"),
      render: (i) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-medium">{i.name}</span>
          <span className="flex items-center gap-1.5 text-xs text-foreground-tertiary">
            {t(`products.types.${i.itemType}`)}
            {!i.isActive && <Badge>{t("products.inactive")}</Badge>}
          </span>
        </span>
      ),
    },
    {
      key: "views",
      header: t("products.fields.views"),
      align: "right",
      render: (i) => count(i.views),
    },
    {
      key: "likes",
      header: t("products.fields.likes"),
      align: "right",
      render: (i) => count(i.likes),
    },
    {
      key: "unitsSold",
      header: t("products.fields.unitsSold"),
      align: "right",
      render: (i) => count(i.unitsSold),
    },
    {
      key: "revenue",
      header: t("products.fields.revenue"),
      align: "right",
      render: (i) => (i.revenue ? formatClp(i.revenue, lang) : "—"),
    },
    {
      key: "quotes",
      header: t("products.fields.quoteRequests"),
      align: "right",
      render: (i) => (i.itemType === "SERVICE" ? count(i.quoteRequests) : "—"),
    },
    {
      key: "conversion",
      header: t("products.fields.conversion"),
      align: "right",
      render: (i) => (i.views ? formatPercent(i.conversionRate, lang) : "—"),
    },
    {
      key: "rating",
      header: t("products.fields.rating"),
      align: "right",
      render: (i) => (i.reviews ? `${rating(i.rating)} (${count(i.reviews)})` : "—"),
    },
  ];

  const exportAll = () =>
    exportToXlsx({
      rows,
      fileName: `${t("products.fileName")}-${range.toLowerCase()}.xlsx`,
      sheetName: t("products.title"),
      columns: [
        { header: t("products.fields.name"), value: (i) => i.name },
        {
          header: t("products.fields.type"),
          value: (i) => t(`products.types.${i.itemType}`),
        },
        {
          header: t("products.fields.active"),
          value: (i) => (i.isActive ? t("products.yes") : t("products.no")),
        },
        { header: t("products.fields.views"), value: (i) => i.views },
        { header: t("products.fields.likes"), value: (i) => i.likes },
        { header: t("products.fields.totalLikes"), value: (i) => i.totalLikes },
        { header: t("products.fields.unitsSold"), value: (i) => i.unitsSold },
        { header: t("products.fields.revenue"), value: (i) => i.revenue },
        { header: t("products.fields.quoteRequests"), value: (i) => i.quoteRequests },
        { header: t("products.fields.bookings"), value: (i) => i.bookings },
        { header: t("products.fields.conversion"), value: (i) => i.conversionRate },
        { header: t("products.fields.rating"), value: (i) => i.rating },
        { header: t("products.fields.reviews"), value: (i) => i.reviews },
      ],
    });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <AnalyticsFrame
        title={t("products.title")}
        subtitle={t("products.subtitle")}
        range={range}
        onRangeChange={setRange}
        ready={items !== null}
        failed={!!error && items === null}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:w-56">
              <Select
                name="sort"
                label={t("products.sortBy")}
                options={SORTS.map((s) => ({
                  value: s,
                  label: t(`products.sorts.${s}`),
                }))}
                value={sort}
                onChangeValue={(v) => setSort(v as Sort)}
              />
            </div>
            <MainButton
              text={t("common.export")}
              variant="outline"
              size="sm"
              leftIcon={Download}
              disabled={rows.length === 0}
              onPress={exportAll}
            />
          </div>
          <div
            className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}
          >
            <DataTable
              columns={columns}
              rows={rows}
              loading={loading && rows.length === 0}
              rowKey={(i) => `${i.itemType}:${i.itemId}`}
              emptyLabel={t("products.empty")}
            />
          </div>
        </div>
      </AnalyticsFrame>
    </div>
  );
}
