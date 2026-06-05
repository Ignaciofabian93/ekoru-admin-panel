"use client";

import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { FormShell } from "@/components/FormShell/FormShell";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Select } from "@/components/Select/Select";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import type { Admin } from "@/types/admin";
import type { AdminPermission, AdminRole, AdminType } from "@/types/enums";
import { ADMIN_ROLES, ADMIN_TYPES } from "../constants";
import { useAdminMutations } from "../hooks/useAdminMutations";
import { PermissionsChecklist } from "./PermissionsChecklist";

export function AdminForm({
  mode,
  lang,
  admin,
}: {
  mode: "create" | "edit";
  lang: SupportedLanguage;
  admin?: Admin;
}) {
  const { t } = useTranslation("admins");
  const { navigateTo } = useNavigation();
  const { createAdmin, updateAdmin, loading } = useAdminMutations();

  const [email, setEmail] = useState(admin?.email ?? "");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(admin?.name ?? "");
  const [lastName, setLastName] = useState(admin?.lastName ?? "");
  const [adminType, setAdminType] = useState<AdminType>(admin?.adminType ?? "PLATFORM");
  const [role, setRole] = useState<AdminRole>(admin?.role ?? "MODERATOR");
  const [permissions, setPermissions] = useState<AdminPermission[]>(
    admin?.permissions ?? [],
  );
  const [sellerId, setSellerId] = useState(admin?.sellerId ?? "");

  const backHref =
    mode === "edit" && admin ? `/${lang}/admins/${admin.id}` : `/${lang}/admins`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create") {
      const ok = await createAdmin({
        email,
        name,
        password,
        lastName: lastName || undefined,
        adminType,
        role,
        permissions,
        sellerId: sellerId || undefined,
      });
      if (ok) navigateTo({ route: `/${lang}/admins` });
    } else if (admin) {
      const ok = await updateAdmin(admin.id, {
        name,
        lastName: lastName || undefined,
        adminType,
        role,
        permissions,
        sellerId: sellerId || undefined,
      });
      if (ok) navigateTo({ route: `/${lang}/admins/${admin.id}` });
    }
  };

  const typeOptions = ADMIN_TYPES.map((v) => ({ value: v, label: t(`adminType.${v}`) }));
  const roleOptions = ADMIN_ROLES.map((v) => ({ value: v, label: t(`role.${v}`) }));

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_ADMINS"
      fallback={<AccessDenied />}
    >
      <FormShell
        backHref={backHref}
        backLabel={t("detail.back")}
        title={mode === "create" ? t("form.createTitle") : t("form.editTitle")}
        subtitle={mode === "create" ? t("form.createSubtitle") : t("form.editSubtitle")}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-lg border border-border-light bg-surface p-5 shadow-sm"
        >
          {mode === "create" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                name="email"
                type="email"
                label={t("form.email")}
                value={email}
                onChangeText={setEmail}
                required
              />
              <Input
                name="password"
                type="password"
                label={t("form.password")}
                value={password}
                onChangeText={setPassword}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="name"
              label={t("form.name")}
              value={name}
              onChangeText={setName}
              required
            />
            <Input
              name="lastName"
              label={t("form.lastName")}
              value={lastName}
              onChangeText={setLastName}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              name="adminType"
              label={t("form.adminType")}
              value={adminType}
              options={typeOptions}
              onChangeValue={(v) => setAdminType(v as AdminType)}
            />
            <Select
              name="role"
              label={t("form.role")}
              value={role}
              options={roleOptions}
              onChangeValue={(v) => setRole(v as AdminRole)}
            />
          </div>

          {adminType === "BUSINESS" && (
            <Input
              name="sellerId"
              label={t("form.sellerId")}
              value={sellerId}
              onChangeText={setSellerId}
            />
          )}

          <div className="flex flex-col gap-3">
            <Title level="h2" size="h6" weight="semibold">
              {t("form.permissions")}
            </Title>
            <PermissionsChecklist value={permissions} onChange={setPermissions} />
          </div>

          <div className="flex justify-end">
            <MainButton
              text={mode === "create" ? t("form.create") : t("form.save")}
              type="submit"
              loading={loading}
            />
          </div>
        </form>
      </FormShell>
    </PermissionGate>
  );
}
