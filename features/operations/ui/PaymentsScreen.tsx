"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import Select from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { ADMIN_PAYMENTS } from "@/graphql/operations/queries";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { usePagedQuery } from "../hooks/usePagedQuery";
import { formatMoney, PAYMENT_STATUSES, PAYMENT_TYPES, type PaymentRow } from "../types";
import { Pager } from "./Pager";
import { StatusBadge } from "./StatusBadge";

/**
 * Every payment on the platform (ADM-1), filterable by status, kind, either
 * party's email and the provider's reference (Webpay buy order). A row opens
 * the payment, where it can be refunded.
 */
export function PaymentsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("operations");
  const { navigateTo } = useNavigation();
  const { rows, pageInfo, loading, filters, setFilter, page, setPage } = usePagedQuery<
    PaymentRow,
    { status: string; paymentType: string; email: string; externalId: string }
  >(ADMIN_PAYMENTS, "adminPayments", {
    status: "",
    paymentType: "",
    email: "",
    externalId: "",
  });

  const reference = (p: PaymentRow) =>
    p.orderId
      ? t("payments.orderRef", { id: String(p.orderId) })
      : p.quotationId
        ? t("payments.quotationRef", { id: String(p.quotationId) })
        : t(`statuses.${p.paymentType}`);

  const columns: Column<PaymentRow>[] = [
    { key: "id", header: t("fields.payment"), render: (p) => `#${p.id}` },
    {
      key: "date",
      header: t("fields.date"),
      render: (p) => formatDate(p.createdAt, lang),
    },
    { key: "ref", header: t("fields.reference"), render: reference },
    { key: "payer", header: t("fields.payer"), render: (p) => p.payer?.email ?? "—" },
    {
      key: "receiver",
      header: t("fields.receiver"),
      render: (p) => p.receiver?.email ?? "—",
    },
    {
      key: "amount",
      header: t("fields.amount"),
      align: "right",
      render: (p) => formatMoney(p.amount, p.currency),
    },
    {
      key: "status",
      header: t("fields.status"),
      render: (p) => <StatusBadge value={p.status} />,
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
            {t("payments.title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("payments.subtitle")}
          </Text>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Select
            name="status"
            label={t("filters.status")}
            options={[
              { value: "", label: t("filters.all") },
              ...PAYMENT_STATUSES.map((s) => ({ value: s, label: t(`statuses.${s}`) })),
            ]}
            value={filters.status}
            onChangeValue={(v) => setFilter("status", v)}
          />
          <Select
            name="paymentType"
            label={t("filters.type")}
            options={[
              { value: "", label: t("filters.all") },
              ...PAYMENT_TYPES.map((s) => ({ value: s, label: t(`statuses.${s}`) })),
            ]}
            value={filters.paymentType}
            onChangeValue={(v) => setFilter("paymentType", v)}
          />
          <Input
            name="email"
            type="email"
            label={t("filters.email")}
            placeholder={t("filters.emailPlaceholder")}
            value={filters.email}
            onChangeText={(v) => setFilter("email", v.trim())}
          />
          <Input
            name="externalId"
            label={t("filters.externalId")}
            value={filters.externalId}
            onChangeText={(v) => setFilter("externalId", v.trim())}
          />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(p) => p.id}
          onRowClick={(p) => navigateTo({ route: `/${lang}/payments/${p.id}` })}
          emptyLabel={t("payments.empty")}
        />
        <Pager pageInfo={pageInfo} page={page} setPage={setPage} />
      </div>
    </PermissionGate>
  );
}
