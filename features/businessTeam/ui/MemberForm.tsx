"use client";

import { useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import Input from "@/components/Input/Input";
import { Select } from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { useAdmin } from "@/store/useAuthStore";
import type { AdminRole } from "@/types/enums";
import { isValidEmail } from "@/utils/inputValidations";
import { BUSINESS_PERMISSIONS, hasPermission } from "@/utils/permissions";
import { NAMESPACE } from "../i18n";
import {
  ROLE_PRESETS,
  TEAM_ROLES,
  type BusinessTeamMember,
  type MemberDraft,
} from "../types";

/**
 * Add or edit one team member. A role preselects its usual permissions, which
 * the owner can then adjust; a permission the signed-in account does not hold
 * cannot be given (the server refuses it too).
 */
export function MemberForm({
  member,
  saving,
  onSubmit,
  onCancel,
}: {
  /** Present when editing; the email is fixed then. */
  member?: BusinessTeamMember;
  saving: boolean;
  onSubmit: (draft: MemberDraft) => Promise<boolean>;
  onCancel: () => void;
}) {
  const { t } = useTranslation(NAMESPACE);
  const me = useAdmin();
  const [draft, setDraft] = useState<MemberDraft>(() => ({
    email: member?.email ?? "",
    name: member?.name ?? "",
    lastName: member?.lastName ?? "",
    role: member?.role ?? "BUSINESS_MANAGER",
    permissions: member?.permissions ?? ROLE_PRESETS.BUSINESS_MANAGER ?? [],
  }));
  const set = (patch: Partial<MemberDraft>) => setDraft((d) => ({ ...d, ...patch }));
  const grantable = (p: (typeof BUSINESS_PERMISSIONS)[number]) => hasPermission(me, p);

  const valid =
    draft.name.trim().length > 0 && (member ? true : isValidEmail(draft.email.trim()));

  const submit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) return;
    if (await onSubmit(draft)) onCancel();
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5"
    >
      <header className="flex flex-col gap-1">
        <Title level="h2" size="h5" weight="semibold">
          {member ? t("form.editTitle", { name: member.name }) : t("form.addTitle")}
        </Title>
        {!member && (
          <Text variant="small" color="secondary">
            {t("form.hint")}
          </Text>
        )}
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          name="email"
          type="email"
          label={t("form.email")}
          value={draft.email}
          onChangeText={(email) => set({ email })}
          disabled={!!member}
          required={!member}
          isInvalid={
            !member && draft.email.length > 0 && !isValidEmail(draft.email.trim())
          }
        />
        <Select
          name="role"
          label={t("form.role")}
          value={draft.role}
          options={TEAM_ROLES.map((role) => ({ value: role, label: t(`roles.${role}`) }))}
          onChangeValue={(value) => {
            const role = value as AdminRole;
            // A new role starts from its usual permissions, minus any the
            // signed-in account cannot give.
            set({
              role,
              permissions: (ROLE_PRESETS[role] ?? []).filter(grantable),
            });
          }}
        />
        <Input
          name="name"
          label={t("form.name")}
          value={draft.name}
          onChangeText={(name) => set({ name })}
          required
        />
        <Input
          name="lastName"
          label={t("form.lastName")}
          value={draft.lastName}
          onChangeText={(lastName) => set({ lastName })}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-foreground">
          {t("form.permissions")}
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {BUSINESS_PERMISSIONS.map((permission) => (
            <Checkbox
              key={permission}
              name={permission}
              label={t(`permissions.${permission}`)}
              checked={draft.permissions.includes(permission)}
              disabled={!grantable(permission)}
              onChange={(checked) =>
                set({
                  permissions: checked
                    ? [...draft.permissions, permission]
                    : draft.permissions.filter((p) => p !== permission),
                })
              }
            />
          ))}
        </div>
        {BUSINESS_PERMISSIONS.some((p) => !grantable(p)) && (
          <Text variant="small" color="tertiary">
            {t("form.notYours")}
          </Text>
        )}
      </fieldset>

      <div className="flex flex-wrap justify-end gap-2">
        <MainButton
          text={t("actions.cancel")}
          variant="ghost"
          size="sm"
          onPress={onCancel}
        />
        <MainButton
          text={member ? t("actions.save") : t("actions.invite")}
          type="submit"
          size="sm"
          loading={saving}
          disabled={!valid}
        />
      </div>
    </form>
  );
}
