"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import Select from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { ADMIN_BOOKINGS } from "@/graphql/operations/queries";
import { ADMIN_CANCEL_BOOKING } from "@/graphql/operations/mutations";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { useAction } from "../hooks/useAction";
import { usePagedQuery } from "../hooks/usePagedQuery";
import { BOOKING_STATUSES, formatMoney, type BookingRow } from "../types";
import { Pager } from "./Pager";
import { StatusBadge } from "./StatusBadge";

const OPEN = new Set(["PENDING", "CONFIRMED", "IN_PROGRESS"]);

/**
 * Service bookings (ADM-5), read-only, with an operator cancel for when the
 * client and the provider disagree. Both are notified.
 */
export function BookingsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("operations");
  const { rows, pageInfo, loading, filters, setFilter, page, setPage, refetch } =
    usePagedQuery<BookingRow, { status: string }>(ADMIN_BOOKINGS, "getServiceBookings", {
      status: "",
    });
  const cancel = useAction(ADMIN_CANCEL_BOOKING);

  const cancelBooking = async (b: BookingRow) => {
    const reason = window.prompt(t("bookings.cancelPrompt", { id: b.id }), "");
    if (!reason?.trim()) return;
    if (
      await cancel.run({ id: b.id, reason: reason.trim() }, "bookings.feedback.cancelled")
    ) {
      await refetch();
    }
  };

  const columns: Column<BookingRow>[] = [
    { key: "id", header: t("fields.booking"), render: (b) => `#${b.id}` },
    {
      key: "service",
      header: t("fields.service"),
      render: (b) => b.service?.name ?? "—",
    },
    { key: "client", header: t("fields.client"), render: (b) => b.client?.email ?? "—" },
    {
      key: "provider",
      header: t("fields.provider"),
      render: (b) => b.provider?.email ?? "—",
    },
    {
      key: "scheduled",
      header: t("fields.scheduled"),
      render: (b) =>
        [formatDate(b.scheduledDate, lang), b.scheduledTimeSlot]
          .filter(Boolean)
          .join(" · "),
    },
    {
      key: "price",
      header: t("fields.price"),
      align: "right",
      render: (b) => formatMoney(b.agreedPrice),
    },
    {
      key: "status",
      header: t("fields.status"),
      render: (b) => (
        <div className="flex flex-col gap-1">
          <StatusBadge value={b.status} />
          {b.cancellationReason && (
            <Text variant="small" color="secondary">
              {b.cancellationReason}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (b) =>
        OPEN.has(b.status) ? (
          <div className="flex justify-end">
            <MainButton
              text={t("actions.cancel")}
              variant="outline"
              size="sm"
              disabled={cancel.loading}
              onPress={() => void cancelBooking(b)}
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
            {t("bookings.title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("bookings.subtitle")}
          </Text>
        </header>
        <div className="max-w-xs">
          <Select
            name="status"
            label={t("filters.status")}
            options={[
              { value: "", label: t("filters.all") },
              ...BOOKING_STATUSES.map((s) => ({ value: s, label: t(`statuses.${s}`) })),
            ]}
            value={filters.status}
            onChangeValue={(v) => setFilter("status", v)}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(b) => b.id}
          emptyLabel={t("bookings.empty")}
        />
        <Pager pageInfo={pageInfo} page={page} setPage={setPage} />
      </div>
    </PermissionGate>
  );
}
