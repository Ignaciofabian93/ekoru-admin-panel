"use client";

import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { FormShell } from "@/components/FormShell/FormShell";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Select } from "@/components/Select/Select";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { humanizeEnum } from "@/utils/formatters";
import { plansForKind } from "../constants";
import { useMembershipMutations } from "../hooks/useMembershipMutations";
import type { Membership, MembershipKind } from "../types";

export function MembershipForm({
  kind,
  mode,
  lang,
  membership,
}: {
  kind: MembershipKind;
  mode: "create" | "edit";
  lang: SupportedLanguage;
  membership?: Membership;
}) {
  const { t } = useTranslation("memberships");
  const { navigateTo } = useNavigation();
  const { create, update, loading } = useMembershipMutations(kind);
  const plans = plansForKind(kind);

  const [membershipType, setMembershipType] = useState<string>(
    membership?.membershipType ?? plans[0],
  );
  const [durationMonths, setDurationMonths] = useState(
    membership ? String(membership.durationMonths) : "1",
  );
  const [isActive, setIsActive] = useState(membership?.isActive ?? true);

  const backHref =
    mode === "edit" && membership
      ? `/${lang}/memberships/${kind}/${membership.id}`
      : `/${lang}/memberships`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create") {
      const ok = await create({
        membershipType,
        durationMonths: Number(durationMonths) || 1,
      });
      if (ok) navigateTo({ route: `/${lang}/memberships` });
    } else if (membership) {
      const ok = await update(membership.id, {
        membershipType,
        durationMonths: Number(durationMonths) || 1,
        isActive,
      });
      if (ok) navigateTo({ route: `/${lang}/memberships/${kind}/${membership.id}` });
    }
  };

  const planOptions = plans.map((p) => ({ value: p, label: humanizeEnum(p) }));
  const title =
    mode === "create"
      ? kind === "person"
        ? t("form.createTitlePerson")
        : t("form.createTitleBusiness")
      : t("form.editTitle");

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      <FormShell backHref={backHref} backLabel={t("detail.back")} title={title}>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-border-light bg-surface p-5 shadow-sm"
        >
          <Select
            name="membershipType"
            label={t("form.membershipType")}
            value={membershipType}
            options={planOptions}
            onChangeValue={setMembershipType}
          />
          <Input
            name="durationMonths"
            type="number"
            label={t("form.durationMonths")}
            value={durationMonths}
            onChangeText={setDurationMonths}
            required
          />
          {mode === "edit" && (
            <Checkbox
              label={t("form.isActive")}
              checked={isActive}
              onChange={setIsActive}
            />
          )}
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
