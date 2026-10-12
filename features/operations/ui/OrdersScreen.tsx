"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import Select from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { ADMIN_ORDERS } from "@/graphql/operations/queries";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { usePagedQuery } from "../hooks/usePagedQuery";
import { formatMoney, ORDER_STATUSES, type OrderRow } from "../types";
import { Pager } from "./Pager";
import { StatusBadge } from "./StatusBadge";

/**
 * Every order on the platform (ADM-1), filterable by status, either party's
 * email and order number. A row opens the order, where its payments can be
 * refunded.
 */
export function OrdersScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("operations");
  const { navigateTo } = useNavigation();
  const { rows, pageInfo, loading, filters, setFilter, page, setPage } = usePagedQuery<
    OrderRow,
    { status: string; email: string; orderId: number | "" }
  >(ADMIN_ORDERS, "adminOrders", { status: "", email: "", orderId: "" });

  const columns: Column<OrderRow>[] = [
    { key: "id", header: t("fields.order"), render: (o) => `#${o.id}` },
    {
      key: "date",
      header: t("fields.date"),
      render: (o) => formatDate(o.createdAt, lang),
    },
    {
      key: "buyer",
      header: t("fields.buyer"),
      render: (o) => o.buyer?.email ?? o.buyerId,
    },
    {
      key: "seller",
      header: t("fields.seller"),
      render: (o) => o.seller?.email ?? o.sellerId,
    },
    {
      key: "total",
      header: t("fields.total"),
      align: "right",
      render: (o) => formatMoney(o.total, o.currency),
    },
    {
      key: "status",
      header: t("fields.status"),
      render: (o) => <StatusBadge value={o.status} />,
    },
    {
      key: "shipping",
      header: t("fields.shipping"),
      render: (o) => <StatusBadge value={o.shippingStatus?.status} />,
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
            {t("orders.title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("orders.subtitle")}
          </Text>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            name="status"
            label={t("filters.status")}
            options={[
              { value: "", label: t("filters.all") },
              ...ORDER_STATUSES.map((s) => ({ value: s, label: t(`statuses.${s}`) })),
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
          <Input
            name="orderId"
            type="number"
            label={t("filters.orderId")}
            value={filters.orderId === "" ? "" : String(filters.orderId)}
            onChangeText={(v) => setFilter("orderId", v ? Number(v) : "")}
          />
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(o) => o.id}
          onRowClick={(o) => navigateTo({ route: `/${lang}/orders/${o.id}` })}
          emptyLabel={t("orders.empty")}
        />
        <Pager pageInfo={pageInfo} page={page} setPage={setPage} />
      </div>
    </PermissionGate>
  );
}
