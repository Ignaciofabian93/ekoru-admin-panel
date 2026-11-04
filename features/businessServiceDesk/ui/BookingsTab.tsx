"use client";

import { useState } from "react";
import clsx from "clsx";
import { useQuery } from "@apollo/client/react";
import { type SupportedLanguage } from "@/constants/settings";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { Text } from "@/components/Text/Text";
import { formatMoney } from "@/features/operations/types";
import { Pager } from "@/features/operations/ui/Pager";
import { StatusBadge } from "@/features/operations/ui/StatusBadge";
import { ADMIN_CANCEL_BOOKING } from "@/graphql/operations/mutations";
import { COMPLETE_BOOKING, MOVE_BOOKING } from "@/graphql/businessServiceDesk/mutations";
import { BUSINESS_BOOKINGS } from "@/graphql/businessServiceDesk/queries";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { useDeskAction } from "../hooks/useDeskAction";
import { NAMESPACE } from "../i18n";
import {
  BOOKING_MOVES,
  BOOKING_STATUSES,
  clientName,
  type BookingMove,
  type DeskBooking,
  type Page,
} from "../types";

const PAGE_SIZE = 20;

/** The store's bookings by state, with the provider's moves on each row. */
export function BookingsTab({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation(NAMESPACE);
  const { t: ops } = useTranslation("operations");
  const [status, setStatus] = useState<string>("PENDING");
  const [page, setPage] = useState(1);
  const { data, loading, refetch } = useQuery<{ myProviderBookings: Page<DeskBooking> }>(
    BUSINESS_BOOKINGS,
    {
      variables: { page, pageSize: PAGE_SIZE, ...(status && { status }) },
      fetchPolicy: "cache-and-network",
      notifyOnNetworkStatusChange: true,
    },
  );
  const { run, busy } = useDeskAction();

  const move = async (booking: DeskBooking, to: BookingMove) => {
    let done = false;
    if (to === "cancel") {
      const reason = window
        .prompt(t("prompts.cancelBooking", { id: booking.id }))
        ?.trim();
      if (!reason) return;
      done = await run(
        booking.id,
        ADMIN_CANCEL_BOOKING,
        { id: booking.id, reason },
        "feedback.cancelledBooking",
      );
    } else {
      if (!window.confirm(t(`confirm.${to}`, { id: booking.id }))) return;
      done =
        to === "complete"
          ? await run(booking.id, COMPLETE_BOOKING, { id: booking.id }, "feedback.moved")
          : await run(
              booking.id,
              MOVE_BOOKING,
              { input: { id: booking.id, status: to } },
              "feedback.moved",
            );
    }
    if (done) await refetch();
  };

  const columns: Column<DeskBooking>[] = [
    { key: "id", header: t("columns.number"), render: (b) => `#${b.id}` },
    {
      key: "service",
      header: t("columns.service"),
      render: (b) => (
        <div className="flex flex-col">
          <Text variant="span" weight="semibold">
            {b.service?.name ?? "—"}
          </Text>
          {b.clientNotes && (
            <Text variant="small" color="tertiary" className="line-clamp-2">
              {b.clientNotes}
            </Text>
          )}
        </div>
      ),
    },
    {
      key: "client",
      header: t("columns.client"),
      render: (b) => (
        <div className="flex flex-col">
          <Text variant="span">{clientName(b.client) ?? "—"}</Text>
          <Text variant="small" color="secondary">
            {[b.client?.email, b.client?.phone].filter(Boolean).join(" · ")}
          </Text>
        </div>
      ),
    },
    {
      key: "scheduled",
      header: t("columns.scheduled"),
      render: (b) =>
        [formatDate(b.scheduledDate, lang), b.scheduledTimeSlot]
          .filter(Boolean)
          .join(" · "),
    },
    {
      key: "price",
      header: t("columns.price"),
      align: "right",
      render: (b) => formatMoney(b.agreedPrice),
    },
    {
      key: "status",
      header: t("columns.status"),
      render: (b) => <StatusBadge value={b.status} />,
    },
    {
      key: "actions",
      header: t("columns.actions"),
      align: "right",
      render: (b) => (
        <div className="flex flex-wrap justify-end gap-1">
          {(BOOKING_MOVES[b.status] ?? []).map((to) => (
            <MainButton
              key={to}
              text={t(`moves.${to}`)}
              variant={to === "cancel" || to === "NO_SHOW" ? "ghost" : "outline"}
              size="sm"
              disabled={busy !== null}
              loading={busy === b.id}
              onPress={() => void move(b, to)}
            />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1 self-start rounded-lg border border-border bg-surface p-1">
        {[...BOOKING_STATUSES, ""].map((s) => (
          <button
            key={s || "all"}
            type="button"
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
              s === status
                ? "bg-primary text-on-primary"
                : "text-foreground-secondary hover:bg-background-tertiary",
            )}
          >
            {s ? ops(`statuses.${s}`) : t("filters.all")}
          </button>
        ))}
      </div>
      <DataTable
        columns={columns}
        rows={data?.myProviderBookings.nodes ?? []}
        loading={loading && !data}
        rowKey={(b) => b.id}
        emptyLabel={t("feedback.emptyBookings")}
      />
      <Pager
        pageInfo={data?.myProviderBookings.pageInfo ?? null}
        page={page}
        setPage={setPage}
      />
    </div>
  );
}
