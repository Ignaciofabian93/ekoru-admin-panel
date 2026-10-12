"use client";

import { useQuery } from "@apollo/client/react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { ADMIN_ORDER, ADMIN_PAYMENTS } from "@/graphql/operations/queries";
import { UPDATE_SHIPPING } from "@/graphql/operations/mutations";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { useAction } from "../hooks/useAction";
import {
  formatMoney,
  type Connection,
  type OrderDetail,
  type PaymentRow,
  type ShippingStage,
} from "../types";
import { StatusBadge } from "./StatusBadge";

/** Where an operator may move shipping from each stage (same rule as the backend). */
const NEXT_STAGES: Record<ShippingStage, ShippingStage[]> = {
  PREPARING: ["SHIPPED", "DELIVERED", "CANCELED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  RETURNED: [],
  CANCELED: [],
};

/**
 * One order (ADM-1): its lines, address, shipping stage and payments. Shipping
 * moves forward from here on paid orders; refunds happen on the payment.
 */
export function OrderDetailScreen({ id, lang }: { id: string; lang: SupportedLanguage }) {
  const { t } = useTranslation("operations");
  const { navigateTo } = useNavigation();
  const order = useQuery<{ getOrder: OrderDetail | null }>(ADMIN_ORDER, {
    variables: { id },
    fetchPolicy: "cache-and-network",
  });
  const payments = useQuery<{ adminPayments: Connection<PaymentRow> }>(ADMIN_PAYMENTS, {
    variables: { page: 1, pageSize: 20, orderId: Number(id) },
    fetchPolicy: "cache-and-network",
  });
  const ship = useAction(UPDATE_SHIPPING);

  const o = order.data?.getOrder ?? null;
  const stage = o?.shippingStatus?.status ?? null;

  const move = async (to: ShippingStage) => {
    if (!window.confirm(t("orders.moveConfirm", { stage: t(`statuses.${to}`) }))) return;
    if (await ship.run({ input: { orderId: id, stage: to } }, "orders.feedback.moved")) {
      await order.refetch();
    }
  };

  const paymentColumns: Column<PaymentRow>[] = [
    { key: "id", header: t("fields.payment"), render: (p) => `#${p.id}` },
    {
      key: "date",
      header: t("fields.date"),
      render: (p) => formatDate(p.createdAt, lang),
    },
    { key: "provider", header: t("fields.provider"), render: (p) => p.paymentProvider },
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
      permission="MANAGE_ORDERS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <MainButton
          text={t("actions.backToOrders")}
          variant="ghost"
          size="sm"
          onPress={() => navigateTo({ route: `/${lang}/orders` })}
        />
        {!o ? (
          <Text variant="p" color="secondary">
            {order.loading ? t("loading") : t("orders.notFound")}
          </Text>
        ) : (
          <>
            <header className="flex flex-wrap items-center gap-3">
              <Title level="h1" size="h3" weight="bold">
                {t("orders.detailTitle", { id: o.id })}
              </Title>
              <StatusBadge value={o.status} />
              <StatusBadge value={stage} />
            </header>

            <section className="grid grid-cols-1 gap-3 rounded-lg border border-border-light bg-surface p-4 sm:grid-cols-2">
              <Info label={t("fields.buyer")} value={o.buyer?.email ?? o.buyerId} />
              <Info label={t("fields.seller")} value={o.seller?.email ?? o.sellerId} />
              <Info label={t("fields.date")} value={formatDate(o.createdAt, lang)} />
              <Info
                label={t("fields.shippingMethod")}
                value={t(`shippingMethods.${o.shippingMethod}`)}
              />
              <Info
                label={t("fields.subtotal")}
                value={formatMoney(o.subtotal, o.currency)}
              />
              <Info
                label={t("fields.shippingCost")}
                value={formatMoney(o.shippingCost, o.currency)}
              />
              <Info label={t("fields.total")} value={formatMoney(o.total, o.currency)} />
              {o.shippingAddress && (
                <Info
                  label={t("fields.address")}
                  value={[
                    o.shippingAddress.recipientName,
                    o.shippingAddress.street,
                    o.shippingAddress.reference,
                    o.shippingAddress.phone,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              )}
            </section>

            <section className="flex flex-col gap-2">
              <Title level="h2" size="h5" weight="semibold">
                {t("orders.items")}
              </Title>
              <DataTable
                columns={[
                  {
                    key: "product",
                    header: t("fields.product"),
                    render: (i) =>
                      i.storeProductId
                        ? t("orders.storeProduct", { id: String(i.storeProductId) })
                        : t("orders.marketplaceProduct", { id: String(i.productId) }),
                  },
                  {
                    key: "qty",
                    header: t("fields.quantity"),
                    align: "center",
                    render: (i) => String(i.quantity),
                  },
                  {
                    key: "price",
                    header: t("fields.unitPrice"),
                    align: "right",
                    render: (i) => formatMoney(i.price, o.currency),
                  },
                ]}
                rows={o.orderItems}
                rowKey={(i) => i.id}
                emptyLabel="—"
              />
            </section>

            {o.status === "PAID" && stage && NEXT_STAGES[stage].length > 0 && (
              <section className="flex flex-wrap items-center gap-2">
                <Text variant="span" weight="semibold">
                  {t("orders.moveShipping")}
                </Text>
                {NEXT_STAGES[stage].map((to) => (
                  <MainButton
                    key={to}
                    text={t(`statuses.${to}`)}
                    variant="outline"
                    size="sm"
                    disabled={ship.loading}
                    onPress={() => void move(to)}
                  />
                ))}
              </section>
            )}

            <section className="flex flex-col gap-2">
              <Title level="h2" size="h5" weight="semibold">
                {t("orders.payments")}
              </Title>
              <DataTable
                columns={paymentColumns}
                rows={payments.data?.adminPayments.nodes ?? []}
                loading={payments.loading}
                rowKey={(p) => p.id}
                onRowClick={(p) => navigateTo({ route: `/${lang}/payments/${p.id}` })}
                emptyLabel={t("payments.empty")}
              />
            </section>
          </>
        )}
      </div>
    </PermissionGate>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <Text variant="small" color="tertiary">
        {label}
      </Text>
      <Text variant="span">{value}</Text>
    </div>
  );
}
