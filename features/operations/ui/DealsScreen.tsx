"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import Select from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { ADMIN_DEALS } from "@/graphql/operations/queries";
import { RESOLVE_DEAL } from "@/graphql/operations/mutations";
import { useTranslation } from "@/i18n/context";
import { useCan } from "@/store/useAuthStore";
import { formatDate } from "@/utils/formatters";
import { resolveImageUrl } from "@/utils/imageUrl";
import { useAction } from "../hooks/useAction";
import { usePagedQuery } from "../hooks/usePagedQuery";
import { DEAL_STATUSES, formatMoney, type DealRow } from "../types";
import { Pager } from "./Pager";
import { StatusBadge } from "./StatusBadge";

/**
 * P2P deals (ADM-2), disputed ones first. An operator with MANAGE_ORDERS
 * closes a dispute as completed (both get points and the items leave the
 * market) or cancelled (the items return to sale), optionally with a strike
 * on the seller.
 */
export function DealsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("operations");
  const canResolve = useCan("MANAGE_ORDERS");
  const { rows, pageInfo, loading, filters, setFilter, page, setPage, refetch } =
    usePagedQuery<DealRow, { status: string; email: string }>(ADMIN_DEALS, "adminDeals", {
      status: "DISPUTED",
      email: "",
    });
  const resolve = useAction(RESOLVE_DEAL);

  const close = async (
    deal: DealRow,
    outcome: "COMPLETED" | "CANCELLED",
    strike: boolean,
  ) => {
    const key = strike ? "deals.strikeConfirm" : `deals.${outcome.toLowerCase()}Confirm`;
    if (!window.confirm(t(key, { id: String(deal.id) }))) return;
    const ok = await resolve.run(
      {
        id: deal.id,
        outcome,
        strikeSellerId: strike ? deal.sellerId : null,
      },
      "deals.feedback.resolved",
    );
    if (ok) await refetch();
  };

  const confirmed = (at: string | null) =>
    at ? formatDate(at, lang) : t("deals.notConfirmed");

  const columns: Column<DealRow>[] = [
    {
      key: "id",
      header: t("fields.deal"),
      render: (d) => (
        <div className="flex flex-col">
          <Text variant="span" weight="semibold">{`#${d.id}`}</Text>
          <Text variant="small" color="tertiary">
            {t(`statuses.${d.type}`)}
          </Text>
        </div>
      ),
    },
    {
      key: "buyer",
      header: t("fields.buyer"),
      render: (d) => d.buyer?.email ?? d.buyerId,
    },
    {
      key: "seller",
      header: t("fields.seller"),
      render: (d) => d.seller?.email ?? d.sellerId,
    },
    {
      key: "confirmations",
      header: t("fields.confirmations"),
      render: (d) => (
        <div className="flex flex-col">
          <Text variant="small">{`${t("fields.buyer")}: ${confirmed(d.buyerConfirmedAt)}`}</Text>
          <Text variant="small">{`${t("fields.seller")}: ${confirmed(d.sellerConfirmedAt)}`}</Text>
          {d.compensationAmount > 0 && (
            <Text variant="small" color="tertiary">
              {t("deals.compensation", { amount: formatMoney(d.compensationAmount) })}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: "evidence",
      header: t("fields.evidence"),
      render: (d) => (
        <div className="flex flex-col">
          {[d.buyerEvidenceUrl, d.sellerEvidenceUrl].filter(Boolean).map((url, i) => (
            <a
              key={url}
              href={resolveImageUrl(url) ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {t("deals.photo", { n: String(i + 1) })}
            </a>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: t("fields.status"),
      render: (d) => (
        <div className="flex flex-col gap-1">
          <StatusBadge value={d.status} />
          {(d.disputeReason || d.cancelReason) && (
            <Text variant="small" color="secondary">
              {d.disputeReason ?? d.cancelReason}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (d) =>
        d.status === "DISPUTED" && canResolve ? (
          <div className="flex flex-wrap justify-end gap-2">
            <MainButton
              text={t("actions.complete")}
              size="sm"
              disabled={resolve.loading}
              onPress={() => void close(d, "COMPLETED", false)}
            />
            <MainButton
              text={t("actions.cancel")}
              variant="outline"
              size="sm"
              disabled={resolve.loading}
              onPress={() => void close(d, "CANCELLED", false)}
            />
            <MainButton
              text={t("actions.cancelAndStrike")}
              variant="error"
              size="sm"
              disabled={resolve.loading}
              onPress={() => void close(d, "CANCELLED", true)}
            />
          </div>
        ) : null,
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="VIEW_TRANSACTIONS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-1">
          <Title level="h1" size="h3" weight="bold">
            {t("deals.title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("deals.subtitle")}
          </Text>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            name="status"
            label={t("filters.status")}
            options={[
              { value: "", label: t("filters.all") },
              ...DEAL_STATUSES.map((s) => ({ value: s, label: t(`statuses.${s}`) })),
            ]}
            value={filters.status}
            onChangeValue={(v) => setFilter("status", v)}
          />
          <Input
            name="email"
            type="email"
            label={t("filters.email")}
            placeholder={t("filters.emailPlaceholder")}
            value={filters.email}
            onChangeText={(v) => setFilter("email", v.trim())}
          />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(d) => String(d.id)}
          emptyLabel={t("deals.empty")}
        />
        <Pager pageInfo={pageInfo} page={page} setPage={setPage} />
      </div>
    </PermissionGate>
  );
}
