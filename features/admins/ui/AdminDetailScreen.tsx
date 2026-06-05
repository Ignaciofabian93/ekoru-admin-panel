"use client";

import { useState } from "react";
import { Pencil, Power, Trash2 } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { FormShell } from "@/components/FormShell/FormShell";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import type { Admin } from "@/types/admin";
import type { AdminPermission } from "@/types/enums";
import { useAdminDetail } from "../hooks/useAdminDetail";
import { useAdminMutations } from "../hooks/useAdminMutations";
import { adminDisplayName } from "../types";
import { PermissionsChecklist } from "./PermissionsChecklist";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Text variant="small" color="tertiary">
        {label}
      </Text>
      <Text variant="span">{value || "—"}</Text>
    </div>
  );
}

/**
 * Permission editor with its own draft state. Mounted with a key tied to the
 * admin's current permissions so it resets whenever the saved set changes —
 * avoids syncing state inside an effect.
 */
function AdminPermissionsEditor({
  admin,
  loading,
  onSave,
}: {
  admin: Admin;
  loading: boolean;
  onSave: (permissions: AdminPermission[]) => void;
}) {
  const { t } = useTranslation("admins");
  const [perms, setPerms] = useState<AdminPermission[]>(admin.permissions);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <Title level="h2" size="h6" weight="semibold">
        {t("detail.permissions")}
      </Title>
      <PermissionsChecklist value={perms} onChange={setPerms} />
      <div className="flex justify-end">
        <MainButton
          text={t("detail.savePermissions")}
          size="sm"
          loading={loading}
          onPress={() => onSave(perms)}
        />
      </div>
    </section>
  );
}

export function AdminDetailScreen({ id, lang }: { id: string; lang: SupportedLanguage }) {
  const { t } = useTranslation("admins");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { admin, loading, refetch } = useAdminDetail(id);
  const {
    toggleStatus,
    removeAdmin,
    assignPermissions,
    loading: mutating,
  } = useAdminMutations();

  const handleToggle = () =>
    admin && toggleStatus(admin.id, !admin.isActive).then(() => refetch());
  const handleDelete = async () => {
    if (!admin || !window.confirm(t("detail.deleteConfirm"))) return;
    const ok = await removeAdmin(admin.id);
    if (ok) navigateTo({ route: `/${lang}/admins` });
  };

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_ADMINS"
      fallback={<AccessDenied />}
    >
      {loading && (
        <div className="py-20 text-center">
          <Text variant="p" color="tertiary">
            {tc("common.loading")}
          </Text>
        </div>
      )}

      {!loading && !admin && (
        <div className="py-20 text-center">
          <Text variant="p" color="tertiary">
            {t("detail.notFound")}
          </Text>
        </div>
      )}

      {!loading && admin && (
        <FormShell
          backHref={`/${lang}/admins`}
          backLabel={t("detail.back")}
          title={adminDisplayName(admin)}
          subtitle={admin.email}
          actions={
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{t(`adminType.${admin.adminType}`)}</Badge>
              <Badge tone={admin.isActive ? "success" : "danger"}>
                {admin.isActive ? tc("common.active") : tc("common.inactive")}
              </Badge>
            </div>
          }
        >
          <section className="grid grid-cols-1 gap-4 rounded-lg border border-border-light bg-surface p-5 shadow-sm sm:grid-cols-2">
            <Field label={t("table.role")} value={t(`role.${admin.role}`)} />
            <Field
              label={t("detail.lastLogin")}
              value={formatDate(admin.lastLoginAt, lang)}
            />
            <Field
              label={t("detail.emailVerified")}
              value={admin.isEmailVerified ? tc("common.yes") : tc("common.no")}
            />
            <Field
              label={t("detail.accountLocked")}
              value={admin.accountLocked ? tc("common.yes") : tc("common.no")}
            />
            <Field
              label={t("detail.created")}
              value={formatDate(admin.createdAt, lang)}
            />
            {admin.sellerId && (
              <Field label={t("form.sellerId")} value={admin.sellerId} />
            )}
          </section>

          <AdminPermissionsEditor
            key={admin.permissions.join(",")}
            admin={admin}
            loading={mutating}
            onSave={(next) => assignPermissions(admin.id, next).then(() => refetch())}
          />

          <section className="flex flex-wrap gap-3">
            <MainButton
              text={admin.isActive ? t("detail.deactivate") : t("detail.activate")}
              variant={admin.isActive ? "outline" : "primary"}
              size="sm"
              leftIcon={Power}
              loading={mutating}
              onPress={handleToggle}
            />
            <MainButton
              text={t("detail.edit")}
              variant="secondary_outline"
              size="sm"
              leftIcon={Pencil}
              onPress={() => navigateTo({ route: `/${lang}/admins/${admin.id}/edit` })}
            />
            <MainButton
              text={t("detail.delete")}
              variant="error"
              size="sm"
              leftIcon={Trash2}
              loading={mutating}
              onPress={handleDelete}
            />
          </section>
        </FormShell>
      )}
    </PermissionGate>
  );
}
