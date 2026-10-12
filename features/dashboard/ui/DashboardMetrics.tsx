"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import type { DocumentNode } from "graphql";
import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import {
  FAILED_PAYMENTS_SINCE,
  NEW_SELLERS,
  OPEN_DISPUTES,
  OPEN_EVENT_REPORTS,
  ORDERS_SINCE,
  PENDING_BUSINESSES,
} from "@/graphql/dashboard/queries";
import { useTranslation } from "@/i18n/context";
import { useCan, useIsPlatformAdmin } from "@/store/useAuthStore";
import type { AdminPermission } from "@/types/enums";

type Metric = {
  key: string;
  query: DocumentNode;
  field: string;
  permission: AdminPermission;
  /** Where the card leads, relative to `/[lang]`. */
  to: string;
  /** Variables: "today" counts from midnight, "week" from seven days ago. */
  since?: "today" | "week";
  /** Highlight when above zero: something needs an operator. */
  alert?: boolean;
};

const METRICS: Metric[] = [
  {
    key: "pendingBusinesses",
    query: PENDING_BUSINESSES,
    field: "getSellers",
    permission: "MANAGE_USERS",
    to: "users",
    alert: true,
  },
  {
    key: "newSellers",
    query: NEW_SELLERS,
    field: "getSellers",
    permission: "MANAGE_USERS",
    to: "users",
    since: "week",
  },
  {
    key: "ordersToday",
    query: ORDERS_SINCE,
    field: "adminOrders",
    permission: "MANAGE_ORDERS",
    to: "orders",
    since: "today",
  },
  {
    key: "failedPaymentsToday",
    query: FAILED_PAYMENTS_SINCE,
    field: "adminPayments",
    permission: "VIEW_TRANSACTIONS",
    to: "payments",
    since: "today",
    alert: true,
  },
  {
    key: "openDisputes",
    query: OPEN_DISPUTES,
    field: "adminDeals",
    permission: "VIEW_TRANSACTIONS",
    to: "exchanges",
    alert: true,
  },
  {
    key: "openEventReports",
    query: OPEN_EVENT_REPORTS,
    field: "communityEventReports",
    permission: "MODERATE_CONTENT",
    to: "community-reports",
    alert: true,
  },
];

/** Midnight today and seven days ago, as ISO strings. */
function windows() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const week = new Date(today.getTime() - 6 * 24 * 3600 * 1000);
  return { today: today.toISOString(), week: week.toISOString() };
}

/** The day's numbers for platform admins (ADM-3); each card opens its list. */
export function DashboardMetrics({ lang }: { lang: SupportedLanguage }) {
  const isPlatform = useIsPlatformAdmin();
  // Fixed for the life of the page: "today" and "the last week" as of opening it.
  const [since] = useState(windows);
  if (!isPlatform) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {METRICS.map((m) => (
        <MetricCard
          key={m.key}
          metric={m}
          lang={lang}
          since={m.since ? since[m.since] : undefined}
        />
      ))}
    </div>
  );
}

function MetricCard({
  metric,
  lang,
  since,
}: {
  metric: Metric;
  lang: SupportedLanguage;
  since?: string;
}) {
  const { t } = useTranslation("dashboard");
  const allowed = useCan(metric.permission);
  const { data, error } = useQuery<Record<string, { pageInfo: { totalCount: number } }>>(
    metric.query,
    {
      variables: since ? { since } : undefined,
      skip: !allowed,
      fetchPolicy: "cache-and-network",
    },
  );
  if (!allowed) return null;
  const count = data?.[metric.field]?.pageInfo.totalCount;
  const highlight = metric.alert && (count ?? 0) > 0;
  return (
    <Link
      href={`/${lang}/${metric.to}`}
      className={`flex flex-col gap-1 rounded-lg border p-4 shadow-sm transition-colors hover:border-primary-light ${
        highlight ? "border-warning bg-warning/10" : "border-border-light bg-surface"
      }`}
    >
      <Text variant="span" weight="bold" size="xl">
        {error ? "—" : count == null ? "…" : String(count)}
      </Text>
      <Text variant="small" color="secondary">
        {t(`metrics.${metric.key}`)}
      </Text>
    </Link>
  );
}
