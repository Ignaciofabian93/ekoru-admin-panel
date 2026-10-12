"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { DataTable } from "@/components/DataTable/DataTable";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { ADMIN_PAYMENT } from "@/graphql/operations/queries";
import { REFUND_PAYMENT } from "@/graphql/operations/mutations";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useCan } from "@/store/useAuthStore";
import { formatDate } from "@/utils/formatters";
import { useAction } from "../hooks/useAction";
import { formatMoney, type PaymentDetail, type RefundRow } from "../types";
import { StatusBadge } from "./StatusBadge";

/** Refund rows that already claim part of the payment (the backend's cap). */
const CLAIMING = new Set(["PENDING", "PROCESSING", "COMPLETED"]);

/**
 * One payment and its refunds (ADM-1). An admin with PROCESS_REFUNDS gives
 * money back, in full or in part, with a reason. The provider is called for
 * real; the refund shows PENDING until it answers.
 */
export function PaymentDetailScreen({
  id,
  lang,
}: {
  id: string;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("operations");
  const { navigateTo } = useNavigation();
  const canRefund = useCan("PROCESS_REFUNDS");
  const { data, loading, refetch } = useQuery<{
    getPayment: PaymentDetail | null;
    adminPaymentRefunds: RefundRow[];
  }>(ADMIN_PAYMENT, {
    variables: { id, paymentId: Number(id) },
    fetchPolicy: "cache-and-network",
  });
  const refund = useAction(REFUND_PAYMENT);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const p = data?.getPayment ?? null;
  const refunds = data?.adminPaymentRefunds ?? [];
  const claimed = refunds
    .filter((r) => CLAIMING.has(r.status))
    .reduce((sum, r) => sum + r.amount, 0);
  const remaining = p ? Math.max(p.amount - claimed, 0) : 0;
  const refundable =
    !!p &&
    (p.status === "COMPLETED" || p.status === "PARTIALLY_REFUNDED") &&
    remaining > 0;

  const submit = async () => {
    const value = Number(amount || remaining);
    if (!(value > 0) || value > remaining || !reason.trim()) return;
    if (
      !window.confirm(
        t("payments.refundConfirm", { amount: formatMoney(value, p?.currency) }),
      )
    ) {
      return;
    }
    const ok = await refund.run(
      { input: { paymentId: Number(id), amount: value, reason: reason.trim() } },
      "payments.feedback.refundRequested",
    );
    if (ok) {
      setAmount("");
      setReason("");
      await refetch();
    }
  };

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="VIEW_TRANSACTIONS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <MainButton
          text={t("actions.backToPayments")}
          variant="ghost"
          size="sm"
          onPress={() => navigateTo({ route: `/${lang}/payments` })}
        />
        {!p ? (
          <Text variant="p" color="secondary">
            {loading ? t("loading") : t("payments.notFound")}
          </Text>
        ) : (
          <>
            <header className="flex flex-wrap items-center gap-3">
              <Title level="h1" size="h3" weight="bold">
                {t("payments.detailTitle", { id: p.id })}
              </Title>
              <StatusBadge value={p.status} />
            </header>

            <section className="grid grid-cols-1 gap-3 rounded-lg border border-border-light bg-surface p-4 sm:grid-cols-2">
              <Info
                label={t("fields.amount")}
                value={formatMoney(p.amount, p.currency)}
              />
              <Info label={t("fields.type")} value={t(`statuses.${p.paymentType}`)} />
              <Info label={t("fields.payer")} value={p.payer?.email ?? "—"} />
              <Info label={t("fields.receiver")} value={p.receiver?.email ?? "—"} />
              <Info label={t("fields.provider")} value={p.paymentProvider} />
              <Info label={t("fields.externalId")} value={p.externalId ?? "—"} />
              <Info label={t("fields.date")} value={formatDate(p.createdAt, lang)} />
              <Info
                label={t("fields.processedAt")}
                value={formatDate(p.processedAt, lang)}
              />
              {p.orderId != null && (
                <button
                  type="button"
                  className="text-left font-semibold text-primary hover:underline"
                  onClick={() => navigateTo({ route: `/${lang}/orders/${p.orderId}` })}
                >
                  {t("payments.orderRef", { id: String(p.orderId) })}
                </button>
              )}
              {p.failureReason && (
                <Info label={t("fields.failure")} value={p.failureReason} />
              )}
            </section>

            <section className="flex flex-col gap-2">
              <Title level="h2" size="h5" weight="semibold">
                {t("payments.refunds")}
              </Title>
              <DataTable
                columns={[
                  {
                    key: "date",
                    header: t("fields.date"),
                    render: (r) => formatDate(r.createdAt, lang),
                  },
                  {
                    key: "amount",
                    header: t("fields.amount"),
                    align: "right",
                    render: (r) => formatMoney(r.amount, p.currency),
                  },
                  { key: "reason", header: t("fields.reason"), render: (r) => r.reason },
                  {
                    key: "status",
                    header: t("fields.status"),
                    render: (r) => <StatusBadge value={r.status} />,
                  },
                ]}
                rows={refunds}
                rowKey={(r) => r.id}
                emptyLabel={t("payments.noRefunds")}
              />
            </section>

            {canRefund && refundable && (
              <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-4">
                <Title level="h2" size="h5" weight="semibold">
                  {t("payments.refundTitle")}
                </Title>
                <Text variant="small" color="secondary">
                  {t("payments.refundHint", {
                    remaining: formatMoney(remaining, p.currency),
                  })}
                </Text>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    name="amount"
                    type="number"
                    label={t("fields.amount")}
                    placeholder={String(remaining)}
                    value={amount}
                    onChangeText={setAmount}
                  />
                  <Input
                    name="reason"
                    label={t("fields.reason")}
                    value={reason}
                    onChangeText={setReason}
                  />
                </div>
                <div className="flex justify-end">
                  <MainButton
                    text={t("actions.refund")}
                    variant="error"
                    size="sm"
                    disabled={
                      refund.loading ||
                      !reason.trim() ||
                      Number(amount || remaining) <= 0 ||
                      Number(amount || remaining) > remaining
                    }
                    onPress={() => void submit()}
                  />
                </div>
              </section>
            )}
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
