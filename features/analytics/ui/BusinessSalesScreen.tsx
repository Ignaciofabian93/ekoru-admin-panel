"use client";

import { useState } from "react";
import { useApolloClient } from "@apollo/client/react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import MainButton from "@/components/Button/MainButton";
import {
  StatTile,
  change,
  formatChange,
  formatClp,
  formatCount,
  formatMoneyFigure,
} from "@/components/Charts";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { Text } from "@/components/Text/Text";
import type { SupportedLanguage } from "@/constants/settings";
import { BUSINESS_SALES } from "@/graphql/analytics/queries";
import { useTranslation } from "@/i18n/context";
import { exportToXlsx } from "@/utils/exportXlsx";
import { formatDate } from "@/utils/formatters";
import { useBusinessAnalytics, useBusinessSales } from "../hooks/useAnalytics";
import { useAnalyticsRange } from "../hooks/useAnalyticsRange";
import type { BusinessTotals, Sale, SalesPageInfo } from "../types";
import { AnalyticsFrame } from "./AnalyticsFrame";

/** Rows per request when exporting the whole period. */
const EXPORT_PAGE = 500;

/**
 * Every payment the business received in the period: amount, EKORU's
 * commission, refunds and what is left for it, with an XLSX export.
 */
export function BusinessSalesScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("analytics");
  const client = useApolloClient();
  const { range, setRange } = useAnalyticsRange();
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const totals = useBusinessAnalytics(range);
  const { rows, pageInfo, loading, error } = useBusinessSales(range, page);

  const clp = (v: number) => formatClp(v, lang);
  const reference = (s: Sale) =>
    s.orderId != null
      ? `#${s.orderId}`
      : s.quotationId != null
        ? `#${s.quotationId}`
        : "—";

  const onRange = (next: typeof range) => {
    setRange(next);
    setPage(1);
  };

  const tile = (key: string, pick: (x: BusinessTotals) => number, upIsGood = true) => {
    const data = totals.data;
    if (!data) return null;
    const delta = change(pick(data.current), pick(data.previous));
    return (
      <StatTile
        key={key}
        label={t(`sales.totals.${key}`)}
        value={formatMoneyFigure(pick(data.current), lang)}
        delta={delta}
        deltaLabel={delta == null ? undefined : formatChange(delta, lang)}
        upIsGood={upIsGood}
      />
    );
  };

  const columns: Column<Sale>[] = [
    {
      key: "date",
      header: t("sales.fields.date"),
      render: (s) => formatDate(s.date, lang),
    },
    {
      key: "type",
      header: t("sales.fields.type"),
      render: (s) => t(`sales.types.${s.type}`),
    },
    { key: "reference", header: t("sales.fields.reference"), render: reference },
    {
      key: "status",
      header: t("sales.fields.status"),
      render: (s) => t(`statuses.${s.status}`),
    },
    {
      key: "amount",
      header: t("sales.fields.amount"),
      align: "right",
      render: (s) => clp(s.amount),
    },
    {
      key: "fee",
      header: t("sales.fields.fee"),
      align: "right",
      render: (s) => clp(s.fee),
    },
    {
      key: "refunded",
      header: t("sales.fields.refunded"),
      align: "right",
      render: (s) => (s.refunded ? clp(s.refunded) : "—"),
    },
    {
      key: "net",
      header: t("sales.fields.net"),
      align: "right",
      render: (s) => clp(s.net),
    },
    {
      key: "units",
      header: t("sales.fields.units"),
      align: "right",
      render: (s) => (s.units ? formatCount(s.units, lang) : "—"),
    },
  ];

  const exportAll = async () => {
    setExporting(true);
    try {
      const all: Sale[] = [];
      for (let p = 1; ; p++) {
        const { data } = await client.query<{
          businessSales: { nodes: Sale[]; pageInfo: SalesPageInfo };
        }>({
          query: BUSINESS_SALES,
          variables: { range, page: p, pageSize: EXPORT_PAGE },
          fetchPolicy: "network-only",
        });
        if (!data) break;
        all.push(...data.businessSales.nodes);
        if (!data.businessSales.pageInfo.hasNextPage) break;
      }
      await exportToXlsx({
        rows: all,
        fileName: `${t("sales.fileName")}-${range.toLowerCase()}.xlsx`,
        sheetName: t("sales.title"),
        columns: [
          { header: t("sales.fields.date"), value: (s) => s.date.slice(0, 10) },
          { header: t("sales.fields.type"), value: (s) => t(`sales.types.${s.type}`) },
          { header: t("sales.fields.reference"), value: reference },
          { header: t("sales.fields.status"), value: (s) => t(`statuses.${s.status}`) },
          { header: t("sales.fields.amount"), value: (s) => s.amount },
          { header: t("sales.fields.fee"), value: (s) => s.fee },
          { header: t("sales.fields.refunded"), value: (s) => s.refunded },
          { header: t("sales.fields.net"), value: (s) => s.net },
          { header: t("sales.fields.units"), value: (s) => s.units },
        ],
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <AnalyticsFrame
        title={t("sales.title")}
        subtitle={t("sales.subtitle")}
        range={range}
        onRangeChange={onRange}
        ready={pageInfo !== null}
        failed={!!error && pageInfo === null}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tile("gross", (x) => x.grossSales)}
            {tile("fees", (x) => x.fees, false)}
            {tile("refunded", (x) => x.refunded, false)}
            {tile("net", (x) => x.netPayout)}
          </div>

          <div className="flex justify-end">
            <MainButton
              text={exporting ? t("common.exporting") : t("common.export")}
              variant="outline"
              size="sm"
              leftIcon={Download}
              loading={exporting}
              disabled={exporting || !pageInfo?.totalCount}
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
              rowKey={(s) => String(s.paymentId)}
              emptyLabel={t("sales.empty")}
            />
          </div>
          <SalesPager pageInfo={pageInfo} page={page} setPage={setPage} />
        </div>
      </AnalyticsFrame>
    </div>
  );
}

function SalesPager({
  pageInfo,
  page,
  setPage,
}: {
  pageInfo: SalesPageInfo | null;
  page: number;
  setPage: (page: number) => void;
}) {
  const { t } = useTranslation("analytics");
  if (!pageInfo) return null;
  if (pageInfo.totalPages <= 1) {
    return (
      <Text variant="small" color="tertiary">
        {t("common.count", { count: String(pageInfo.totalCount) })}
      </Text>
    );
  }
  return (
    <div className="flex items-center justify-between">
      <Text variant="small" color="tertiary">
        {t("common.pageSummary", {
          current: String(pageInfo.currentPage),
          total: String(pageInfo.totalPages),
          count: String(pageInfo.totalCount),
        })}
      </Text>
      <div className="flex gap-2">
        <MainButton
          text={t("common.prev")}
          variant="outline"
          size="sm"
          leftIcon={ChevronLeft}
          disabled={!pageInfo.hasPreviousPage}
          onPress={() => setPage(page - 1)}
        />
        <MainButton
          text={t("common.next")}
          variant="outline"
          size="sm"
          rightIcon={ChevronRight}
          disabled={!pageInfo.hasNextPage}
          onPress={() => setPage(page + 1)}
        />
      </div>
    </div>
  );
}
