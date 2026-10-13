"use client";

import Link from "next/link";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import Select from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { ADMIN_MEMBERSHIP_SUBSCRIPTIONS } from "@/graphql/operations/queries";
import { ADMIN_CANCEL_MEMBERSHIP } from "@/graphql/operations/mutations";
import { useTranslation } from "@/i18n/context";
import { useCan } from "@/store/useAuthStore";
import { formatDate } from "@/utils/formatters";
import { useAction } from "../hooks/useAction";
import { usePagedQuery } from "../hooks/usePagedQuery";
import {
  formatMoney,
  MEMBERSHIP_KINDS,
  MEMBERSHIP_PLANS,
  type MembershipKind,
  type SubscriptionRow,
} from "../types";
import { Pager } from "./Pager";
import { StatusBadge } from "./StatusBadge";

type Filters = {
  kind: MembershipKind;
  active: boolean | "";
  plan: string;
  endsBefore: string;
  search: string;
};

/**
 * Membership subscriptions (ADM-12): who holds which plan, when the term ends
 * and the payment that bought it. Operators with MANAGE_USERS can end a term
 * early; refunds stay on the payment's own page.
 */
export function SubscriptionsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("operations");
  const canCancel = useCan("MANAGE_USERS");
  const { rows, pageInfo, loading, filters, setFilter, page, setPage, refetch } =
    usePagedQuery<SubscriptionRow, Filters>(
      ADMIN_MEMBERSHIP_SUBSCRIPTIONS,
      "adminMembershipSubscriptions",
      { kind: "PERSON", active: "", plan: "", endsBefore: "", search: "" },
    );
  const cancel = useAction(ADMIN_CANCEL_MEMBERSHIP);

  const cancelTerm = async (s: SubscriptionRow) => {
    const who = s.sellerName ?? s.sellerEmail ?? s.sellerId;
    if (!window.confirm(t("subscriptions.cancelConfirm", { id: String(s.id), who })))
      return;
    if (
      await cancel.run({ kind: s.kind, id: s.id }, "subscriptions.feedback.cancelled")
    ) {
      await refetch();
    }
  };

  const columns: Column<SubscriptionRow>[] = [
    { key: "id", header: t("fields.subscription"), render: (s) => `#${s.id}` },
    {
      key: "holder",
      header: t("fields.holder"),
      render: (s) => (
        <div className="flex flex-col">
          <Text variant="small">{s.sellerName ?? "—"}</Text>
          <Text variant="small" color="secondary">
            {s.sellerEmail ?? s.sellerId}
          </Text>
        </div>
      ),
    },
    { key: "plan", header: t("fields.plan"), render: (s) => s.planName ?? s.plan },
    {
      key: "term",
      header: t("fields.term"),
      render: (s) =>
        `${formatDate(s.startDate, lang)} → ${s.endDate ? formatDate(s.endDate, lang) : t("subscriptions.noEnd")}`,
    },
    {
      key: "payment",
      header: t("fields.payment"),
      render: (s) =>
        s.paymentId ? (
          <div className="flex flex-col gap-1">
            <Link
              href={`/${lang}/payments/${s.paymentId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              #{s.paymentId} · {formatMoney(s.paymentAmount)}
            </Link>
            <StatusBadge value={s.paymentStatus} />
          </div>
        ) : (
          <Text variant="small" color="secondary">
            {t("subscriptions.noPayment")}
          </Text>
        ),
    },
    {
      key: "status",
      header: t("fields.status"),
      render: (s) => <StatusBadge value={s.isActive ? "ACTIVE" : "ENDED"} />,
    },
    {
      key: "actions",
      header: "",
      render: (s) =>
        s.isActive && canCancel ? (
          <div className="flex justify-end">
            <MainButton
              text={t("actions.endTerm")}
              variant="outline"
              size="sm"
              disabled={cancel.loading}
              onPress={() => void cancelTerm(s)}
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
            {t("subscriptions.title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("subscriptions.subtitle")}
          </Text>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            name="kind"
            label={t("filters.type")}
            options={MEMBERSHIP_KINDS.map((k) => ({
              value: k,
              label: t(`subscriptions.kinds.${k}`),
            }))}
            value={filters.kind}
            onChangeValue={(v) => {
              setFilter("kind", v as MembershipKind);
              // Plans differ per kind; a person plan means nothing for businesses.
              setFilter("plan", "");
            }}
          />
          <Select
            name="plan"
            label={t("fields.plan")}
            options={[
              { value: "", label: t("filters.all") },
              ...MEMBERSHIP_PLANS[filters.kind].map((p) => ({ value: p, label: p })),
            ]}
            value={filters.plan}
            onChangeValue={(v) => setFilter("plan", v)}
          />
          <Select
            name="active"
            label={t("filters.status")}
            options={[
              { value: "", label: t("filters.all") },
              { value: "true", label: t("statuses.ACTIVE") },
              { value: "false", label: t("statuses.ENDED") },
            ]}
            value={filters.active === "" ? "" : String(filters.active)}
            onChangeValue={(v) => setFilter("active", v === "" ? "" : v === "true")}
          />
          <Input
            name="endsBefore"
            type="date"
            label={t("filters.endsBefore")}
            value={filters.endsBefore}
            onChangeText={(v) => setFilter("endsBefore", v)}
          />
          <Input
            name="search"
            label={t("filters.holder")}
            placeholder={t("filters.emailPlaceholder")}
            value={filters.search}
            onChangeText={(v) => setFilter("search", v.trim())}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(s) => `${s.kind}-${s.id}`}
          emptyLabel={t("subscriptions.empty")}
        />
        <Pager pageInfo={pageInfo} page={page} setPage={setPage} />
      </div>
    </PermissionGate>
  );
}
