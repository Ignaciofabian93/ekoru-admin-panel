"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Select } from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import type { Admin } from "@/types/admin";
import type { AdminRole, AdminType } from "@/types/enums";
import { ADMIN_ROLES, ADMIN_TYPES } from "../constants";
import { useAdmins } from "../hooks/useAdmins";
import { adminDisplayName } from "../types";

export function AdminsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("admins");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { admins, pageInfo, loading, page, setPage, filters, setFilters } = useAdmins();

  const typeOptions = [
    { value: "", label: t("filters.all") },
    ...ADMIN_TYPES.map((v) => ({ value: v, label: t(`adminType.${v}`) })),
  ];
  const roleOptions = [
    { value: "", label: t("filters.all") },
    ...ADMIN_ROLES.map((v) => ({ value: v, label: t(`role.${v}`) })),
  ];
  const statusOptions = [
    { value: "all", label: t("filters.all") },
    { value: "active", label: t("filters.active") },
    { value: "inactive", label: t("filters.inactive") },
  ];
  const statusValue =
    filters.isActive === undefined ? "all" : filters.isActive ? "active" : "inactive";

  const columns: Column<Admin>[] = [
    {
      key: "name",
      header: t("table.name"),
      render: (a) => (
        <Text variant="span" weight="semibold">
          {adminDisplayName(a)}
        </Text>
      ),
    },
    {
      key: "email",
      header: t("table.email"),
      render: (a) => (
        <Text variant="span" color="secondary">
          {a.email}
        </Text>
      ),
    },
    {
      key: "type",
      header: t("table.type"),
      render: (a) => t(`adminType.${a.adminType}`),
    },
    { key: "role", header: t("table.role"), render: (a) => t(`role.${a.role}`) },
    {
      key: "status",
      header: t("table.status"),
      render: (a) => (
        <Badge tone={a.isActive ? "success" : "danger"}>
          {a.isActive ? tc("common.active") : tc("common.inactive")}
        </Badge>
      ),
    },
    {
      key: "lastLogin",
      header: t("table.lastLogin"),
      render: (a) => formatDate(a.lastLoginAt, lang),
    },
  ];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_ADMINS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <Title level="h1" size="h3" weight="bold">
              {t("title")}
            </Title>
            <Text variant="p" color="secondary">
              {t("subtitle")}
            </Text>
          </div>
          <MainButton
            text={t("new")}
            leftIcon={Plus}
            size="sm"
            onPress={() => navigateTo({ route: `/${lang}/admins/new` })}
          />
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select
            label={t("filters.adminType")}
            value={filters.adminType ?? ""}
            options={typeOptions}
            onChangeValue={(v) =>
              setFilters({
                ...filters,
                adminType: (v || undefined) as AdminType | undefined,
              })
            }
          />
          <Select
            label={t("filters.role")}
            value={filters.role ?? ""}
            options={roleOptions}
            onChangeValue={(v) =>
              setFilters({ ...filters, role: (v || undefined) as AdminRole | undefined })
            }
          />
          <Select
            label={t("filters.status")}
            value={statusValue}
            options={statusOptions}
            onChangeValue={(v) =>
              setFilters({
                ...filters,
                isActive: v === "all" ? undefined : v === "active",
              })
            }
          />
        </div>

        <DataTable
          columns={columns}
          rows={admins}
          loading={loading}
          rowKey={(a) => a.id}
          emptyLabel={t("empty")}
          onRowClick={(a) => navigateTo({ route: `/${lang}/admins/${a.id}` })}
        />

        {pageInfo && pageInfo.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Text variant="small" color="tertiary">
              {t("pagination.page", {
                current: String(pageInfo.currentPage),
                total: String(pageInfo.totalPages),
              })}
            </Text>
            <div className="flex gap-2">
              <MainButton
                text={t("pagination.prev")}
                variant="outline"
                size="sm"
                leftIcon={ChevronLeft}
                disabled={!pageInfo.hasPreviousPage}
                onPress={() => setPage(page - 1)}
              />
              <MainButton
                text={t("pagination.next")}
                variant="outline"
                size="sm"
                rightIcon={ChevronRight}
                disabled={!pageInfo.hasNextPage}
                onPress={() => setPage(page + 1)}
              />
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
