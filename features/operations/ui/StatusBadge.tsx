"use client";

import { Badge } from "@/components/Badge/Badge";
import { useTranslation } from "@/i18n/context";

const TONE: Record<string, "success" | "danger" | "warning" | "info" | "neutral"> = {
  PAID: "success",
  COMPLETED: "success",
  DELIVERED: "success",
  CONFIRMED: "info",
  ACCEPTED: "info",
  SHIPPED: "info",
  IN_PROGRESS: "info",
  PROCESSING: "info",
  PREPARING: "warning",
  PENDING: "warning",
  PENDING_PAYMENT: "warning",
  PROPOSED: "warning",
  PARTIALLY_REFUNDED: "warning",
  DISPUTED: "danger",
  FAILED: "danger",
  REFUNDED: "neutral",
  RETURNED: "neutral",
  CANCELED: "neutral",
  CANCELLED: "neutral",
  DECLINED: "neutral",
  EXPIRED: "neutral",
  NO_SHOW: "danger",
};

/** A localized, colour-coded status (order, payment, deal, booking, quote). */
export function StatusBadge({ value }: { value: string | null | undefined }) {
  const { t } = useTranslation("operations");
  if (!value) return <Badge>—</Badge>;
  return <Badge tone={TONE[value] ?? "neutral"}>{t(`statuses.${value}`)}</Badge>;
}
