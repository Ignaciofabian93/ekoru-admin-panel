"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import Select from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { ADMIN_QUOTATIONS } from "@/graphql/operations/queries";
import { ADMIN_CANCEL_QUOTATION } from "@/graphql/operations/mutations";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { useAction } from "../hooks/useAction";
import { usePagedQuery } from "../hooks/usePagedQuery";
import { formatMoney, QUOTATION_STATUSES, type QuotationRow } from "../types";
import { Pager } from "./Pager";
import { StatusBadge } from "./StatusBadge";

/**
 * Quotations by state (ADM-5), read-only, with an operator cancel for an open
 * quote nobody has paid; a paid one is settled with a refund instead.
 */
export function QuotationsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("operations");
  const { rows, pageInfo, loading, filters, setFilter, page, setPage, refetch } =
    usePagedQuery<QuotationRow, { status: string }>(
      ADMIN_QUOTATIONS,
      "getQuotationsByStatus",
      { status: "PENDING" },
    );
  const cancel = useAction(ADMIN_CANCEL_QUOTATION);

  const cancelQuote = async (q: QuotationRow) => {
    const reason = window.prompt(t("quotations.cancelPrompt", { id: q.id }), "");
    if (reason === null) return;
    if (
      await cancel.run(
        { id: q.id, reason: reason.trim() || null },
        "quotations.feedback.cancelled",
      )
    ) {
      await refetch();
    }
  };

  const columns: Column<QuotationRow>[] = [
    {
      key: "id",
      header: t("fields.quotation"),
      render: (q) => (
        <div className="flex flex-col">
          <Text variant="span" weight="semibold">{`#${q.id} · ${q.title}`}</Text>
          <Text variant="small" color="tertiary">
            {q.service?.name ?? ""}
          </Text>
        </div>
      ),
    },
    { key: "client", header: t("fields.client"), render: (q) => q.client?.email ?? "—" },
    {
      key: "provider",
      header: t("fields.provider"),
      render: (q) => q.provider?.email ?? "—",
    },
    {
      key: "date",
      header: t("fields.date"),
      render: (q) => formatDate(q.createdAt, lang),
    },
    {
      key: "price",
      header: t("fields.price"),
      align: "right",
      render: (q) => formatMoney(q.finalPrice ?? q.estimatedPrice),
    },
    {
      key: "status",
      header: t("fields.status"),
      render: (q) => (
        <div className="flex flex-wrap items-center gap-1">
          <StatusBadge value={q.status} />
          {q.paidAt && <Badge tone="success">{t("quotations.paid")}</Badge>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (q) =>
        (q.status === "PENDING" || q.status === "ACCEPTED") && !q.paidAt ? (
          <div className="flex justify-end">
            <MainButton
              text={t("actions.cancel")}
              variant="outline"
              size="sm"
              disabled={cancel.loading}
              onPress={() => void cancelQuote(q)}
            />
          </div>
        ) : null,
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_ORDERS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-1">
          <Title level="h1" size="h3" weight="bold">
            {t("quotations.title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("quotations.subtitle")}
          </Text>
        </header>
        <div className="max-w-xs">
          <Select
            name="status"
            label={t("filters.status")}
            options={QUOTATION_STATUSES.map((s) => ({
              value: s,
              label: t(`statuses.${s}`),
            }))}
            value={filters.status}
            onChangeValue={(v) => setFilter("status", v)}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(q) => q.id}
          emptyLabel={t("quotations.empty")}
        />
        <Pager pageInfo={pageInfo} page={page} setPage={setPage} />
      </div>
    </PermissionGate>
  );
}
