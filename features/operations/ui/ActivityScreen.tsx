"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { ADMIN_ACTIVITY } from "@/graphql/operations/queries";
import { useTranslation } from "@/i18n/context";
import { usePagedQuery } from "../hooks/usePagedQuery";
import { Pager } from "./Pager";

type ActivityRow = {
  id: number;
  adminId: string;
  adminEmail: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  changes: unknown;
  metadata: unknown;
  createdAt: string;
};

const preview = (value: unknown) => {
  if (value == null) return "";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 160 ? `${text.slice(0, 157)}…` : text;
};

/**
 * The admin activity log (ADM-7, SEC-26): who did what, newest first.
 * Filters by action and entity type. Read-only.
 */
export function ActivityScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("operations");
  const { rows, pageInfo, loading, filters, setFilter, page, setPage } = usePagedQuery<
    ActivityRow,
    { action: string; entityType: string }
  >(ADMIN_ACTIVITY, "adminActivityLogs", { action: "", entityType: "" });

  const columns: Column<ActivityRow>[] = [
    {
      key: "date",
      header: t("fields.date"),
      render: (r) =>
        new Intl.DateTimeFormat(lang, { dateStyle: "short", timeStyle: "short" }).format(
          new Date(r.createdAt),
        ),
    },
    { key: "admin", header: t("fields.admin"), render: (r) => r.adminEmail ?? r.adminId },
    { key: "action", header: t("fields.action"), render: (r) => r.action },
    {
      key: "entity",
      header: t("fields.entity"),
      render: (r) => [r.entityType, r.entityId].filter(Boolean).join(" #") || "—",
    },
    {
      key: "details",
      header: t("fields.details"),
      render: (r) => (
        <Text variant="small" color="secondary">
          {preview(r.changes ?? r.metadata)}
        </Text>
      ),
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="VIEW_SYSTEM_LOGS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-1">
          <Title level="h1" size="h3" weight="bold">
            {t("activity.title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("activity.subtitle")}
          </Text>
        </header>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            name="action"
            label={t("fields.action")}
            placeholder="BULK_IMPORT_SELLERS"
            value={filters.action}
            onChangeText={(v) => setFilter("action", v.trim())}
          />
          <Input
            name="entityType"
            label={t("fields.entity")}
            placeholder="Seller"
            value={filters.entityType}
            onChangeText={(v) => setFilter("entityType", v.trim())}
          />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          loading={loading}
          rowKey={(r) => String(r.id)}
          emptyLabel={t("activity.empty")}
        />
        <Pager pageInfo={pageInfo} page={page} setPage={setPage} />
      </div>
    </PermissionGate>
  );
}
