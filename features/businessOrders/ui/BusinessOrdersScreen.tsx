"use client";

import { useState } from "react";
import clsx from "clsx";
import { useQuery } from "@apollo/client/react";
import { type SupportedLanguage } from "@/constants/settings";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { formatMoney } from "@/features/operations/types";
import { Pager } from "@/features/operations/ui/Pager";
import { StatusBadge } from "@/features/operations/ui/StatusBadge";
import { BUSINESS_ORDERS } from "@/graphql/businessOrders/queries";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { NAMESPACE } from "../i18n";
import {
  ORDER_FILTERS,
  buyerName,
  type BusinessOrder,
  type BusinessOrdersData,
  type OrderFilter,
} from "../types";

const PAGE_SIZE = 20;

/**
 * Business area → Pedidos (USR-15): the orders the store received, for the
 * owner or anyone with MANAGE_BUSINESS_ORDERS, starting with what to ship.
 * A row opens the order, where its shipping moves forward.
 */
export function BusinessOrdersScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation(NAMESPACE);
  const { navigateTo } = useNavigation();
  const [filter, setFilter] = useState<OrderFilter>("toShip");
  const [page, setPage] = useState(1);
  const { data, loading } = useQuery<BusinessOrdersData>(BUSINESS_ORDERS, {
    variables: { page, pageSize: PAGE_SIZE, ...ORDER_FILTERS[filter] },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });
  const toShip = data?.toShip.pageInfo.totalCount ?? 0;

  const itemsLine = (order: BusinessOrder) => {
    const [first, ...rest] = order.orderItems.map(
      (item) =>
        `${item.quantity} × ${
          item.storeProduct?.name ??
          t("itemFallback", { id: String(item.storeProductId ?? item.id) })
        }`,
    );
    if (!first) return "—";
    return rest.length ? t("itemsMore", { first, count: String(rest.length) }) : first;
  };

  const columns: Column<BusinessOrder>[] = [
    { key: "id", header: t("columns.order"), render: (o) => `#${o.id}` },
    {
      key: "date",
      header: t("columns.date"),
      render: (o) => formatDate(o.createdAt, lang),
    },
    {
      key: "buyer",
      header: t("columns.buyer"),
      render: (o) => buyerName(o.buyer) ?? "—",
    },
    {
      key: "items",
      header: t("columns.items"),
      render: (o) => (
        <Text variant="small" color="secondary">
          {itemsLine(o)}
        </Text>
      ),
    },
    {
      key: "total",
      header: t("columns.total"),
      align: "right",
      render: (o) => formatMoney(o.total, o.currency),
    },
    {
      key: "status",
      header: t("columns.status"),
      render: (o) => <StatusBadge value={o.status} />,
    },
    {
      key: "shipping",
      header: t("columns.shipping"),
      render: (o) => <StatusBadge value={o.shippingStatus?.status} />,
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <Title level="h1" size="h3" weight="bold">
          {t("title")}
        </Title>
        <Text variant="p" color="secondary">
          {t("subtitle")}
        </Text>
      </header>

      <div className="flex flex-wrap gap-1 self-start rounded-lg border border-border bg-surface p-1">
        {(Object.keys(ORDER_FILTERS) as OrderFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
              f === filter
                ? "bg-primary text-on-primary"
                : "text-foreground-secondary hover:bg-background-tertiary",
            )}
          >
            {t(`filters.${f}`, { count: String(toShip) })}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={data?.getOrdersBySeller.nodes ?? []}
        loading={loading && !data}
        rowKey={(o) => o.id}
        onRowClick={(o) => navigateTo({ route: `/${lang}/business-orders/${o.id}` })}
        emptyLabel={t(filter === "toShip" ? "empty.toShip" : "empty.other")}
      />
      <Pager
        pageInfo={data?.getOrdersBySeller.pageInfo ?? null}
        page={page}
        setPage={setPage}
      />
    </div>
  );
}
