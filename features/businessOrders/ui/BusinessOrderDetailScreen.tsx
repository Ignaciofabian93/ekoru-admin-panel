"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { ArrowLeft } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import MainButton from "@/components/Button/MainButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useAction } from "@/features/operations/hooks/useAction";
import { formatMoney } from "@/features/operations/types";
import { StatusBadge } from "@/features/operations/ui/StatusBadge";
import { BUSINESS_ORDER } from "@/graphql/businessOrders/queries";
import { UPDATE_SHIPPING } from "@/graphql/operations/mutations";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { resolveImageUrl } from "@/utils/imageUrl";
import { useAddressNames } from "../hooks/useAddressNames";
import { NAMESPACE } from "../i18n";
import { NEXT_STAGES, buyerName, type BusinessOrder, type ShippingStage } from "../types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <Title level="h2" size="h6" weight="semibold">
        {title}
      </Title>
      {children}
    </section>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <Text variant="small" color="secondary">
        {label}
      </Text>
      <Text variant="small" weight="semibold">
        {value}
      </Text>
    </div>
  );
}

/**
 * One order the store received (USR-15): who bought, where it goes, what is
 * in it, and its shipping, which the team moves forward from here. The rules
 * are the backend's: only a paid order ships, and the buyer is told at each
 * step. Refunds stay with EKORU.
 */
export function BusinessOrderDetailScreen({
  id,
  lang,
}: {
  id: string;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation(NAMESPACE);
  const { t: ops } = useTranslation("operations");
  const { navigateTo } = useNavigation();
  const { data, loading, refetch } = useQuery<{ getOrder: BusinessOrder | null }>(
    BUSINESS_ORDER,
    { variables: { id }, fetchPolicy: "cache-and-network" },
  );
  const ship = useAction(UPDATE_SHIPPING);
  const [tracking, setTracking] = useState("");

  const order = data?.getOrder ?? null;
  const place = useAddressNames(order?.shippingAddress);
  const stage = order?.shippingStatus?.status ?? null;
  const next = order?.status === "PAID" && stage ? NEXT_STAGES[stage] : [];

  const move = async (to: ShippingStage) => {
    if (!window.confirm(ops("orders.moveConfirm", { stage: ops(`statuses.${to}`) }))) {
      return;
    }
    const input = {
      orderId: id,
      stage: to,
      ...(to === "SHIPPED" && tracking.trim() && { trackingInfo: tracking.trim() }),
    };
    if (await ship.run({ input }, "orders.feedback.moved")) {
      setTracking("");
      await refetch();
    }
  };

  const back = (
    <div>
      <MainButton
        text={t("detail.back")}
        variant="ghost"
        size="sm"
        leftIcon={ArrowLeft}
        onPress={() => navigateTo({ route: `/${lang}/business-orders` })}
      />
    </div>
  );

  if (!order) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        {back}
        <Text variant="p" color="secondary">
          {loading ? ops("loading") : t("detail.notFound")}
        </Text>
      </div>
    );
  }

  const address = order.shippingAddress;
  const buyer = order.buyer;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5">
      {back}
      <header className="flex flex-wrap items-center gap-3">
        <Title level="h1" size="h3" weight="bold">
          {t("detail.title", { id: order.id })}
        </Title>
        <StatusBadge value={order.status} />
        <StatusBadge value={stage} />
        <Text variant="small" color="tertiary">
          {formatDate(order.createdAt, lang)}
        </Text>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Section title={t("detail.buyer")}>
          <Text variant="span" weight="semibold">
            {buyerName(buyer) ?? "—"}
          </Text>
          {buyer?.email || buyer?.phone ? (
            <Text variant="small" color="secondary">
              {[buyer.email, buyer.phone].filter(Boolean).join(" · ")}
            </Text>
          ) : (
            <Text variant="small" color="tertiary">
              {t("detail.contactHidden")}
            </Text>
          )}
        </Section>

        <Section title={t("detail.address")}>
          <Text variant="small" weight="semibold">
            {ops(`shippingMethods.${order.shippingMethod}`)}
          </Text>
          {address ? (
            <Text variant="small" color="secondary">
              {[
                address.recipientName,
                address.street,
                address.reference,
                ...(place ?? []),
                address.zipCode,
                address.phone,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          ) : (
            <Text variant="small" color="tertiary">
              {t("detail.noAddress")}
            </Text>
          )}
        </Section>
      </div>

      <Section title={t("detail.items")}>
        <ul className="flex flex-col gap-3">
          {order.orderItems.map((item) => {
            const image = resolveImageUrl(item.storeProduct?.images?.[0]);
            return (
              <li key={item.id} className="flex items-center gap-3">
                <span className="size-12 shrink-0 overflow-hidden rounded-md border border-border bg-background-tertiary">
                  {image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image} alt="" className="size-full object-cover" />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Text variant="span" weight="semibold" className="truncate">
                    {item.storeProduct?.name ??
                      t("itemFallback", { id: String(item.storeProductId ?? item.id) })}
                  </Text>
                  <Text variant="small" color="secondary">
                    {t("detail.unit", {
                      quantity: String(item.quantity),
                      price: formatMoney(item.price, order.currency),
                    })}
                  </Text>
                </div>
                <Text variant="span" weight="semibold">
                  {formatMoney(item.price * item.quantity, order.currency)}
                </Text>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col gap-1 border-t border-border pt-3">
          <Line
            label={ops("fields.subtotal")}
            value={formatMoney(order.subtotal, order.currency)}
          />
          <Line
            label={ops("fields.shippingCost")}
            value={formatMoney(order.shippingCost, order.currency)}
          />
          <Line
            label={ops("fields.total")}
            value={formatMoney(order.total, order.currency)}
          />
        </div>
      </Section>

      <Section title={t("detail.shippingTitle")}>
        {order.shippingStatus?.trackingInfo && (
          <Line label={t("detail.tracking")} value={order.shippingStatus.trackingInfo} />
        )}
        {order.status !== "PAID" ? (
          <Text variant="small" color="secondary">
            {t("detail.notPaid")}
          </Text>
        ) : next.length === 0 ? (
          <Text variant="small" color="secondary">
            {t("detail.final")}
          </Text>
        ) : (
          <div className="flex flex-col gap-3">
            {next.includes("SHIPPED") && (
              <div className="flex flex-col gap-1 sm:max-w-md">
                <Input
                  name="trackingInfo"
                  label={t("detail.trackingLabel")}
                  placeholder={t("detail.trackingPlaceholder")}
                  maxLength={200}
                  value={tracking}
                  onChangeText={setTracking}
                />
                <Text variant="small" color="tertiary">
                  {t("detail.trackingHint")}
                </Text>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Text variant="span" weight="semibold">
                {t("detail.move")}
              </Text>
              {next.map((to) => (
                <MainButton
                  key={to}
                  text={ops(`statuses.${to}`)}
                  variant={to === "CANCELED" || to === "RETURNED" ? "outline" : "primary"}
                  size="sm"
                  disabled={ship.loading}
                  onPress={() => void move(to)}
                />
              ))}
            </div>
          </div>
        )}
        <Text variant="small" color="tertiary">
          {t("detail.refundHint")}
        </Text>
      </Section>
    </div>
  );
}
