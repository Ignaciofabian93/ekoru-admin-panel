"use client";

import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { FormShell } from "@/components/FormShell/FormShell";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Textarea } from "@/components/Textarea/Textarea";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import type { SellerLevel } from "@/types/account";
import { useSellerLevelMutations } from "../hooks/useSellerLevelMutations";

export function SellerLevelForm({
  mode,
  lang,
  level,
}: {
  mode: "create" | "edit";
  lang: SupportedLanguage;
  level?: SellerLevel;
}) {
  const { t } = useTranslation("sellerLevels");
  const { navigateTo } = useNavigation();
  const { createLevel, updateLevel, loading } = useSellerLevelMutations();

  const [levelName, setLevelName] = useState(level?.levelName ?? "");
  const [minPoints, setMinPoints] = useState(level ? String(level.minPoints) : "0");
  const [maxPoints, setMaxPoints] = useState(
    level?.maxPoints != null ? String(level.maxPoints) : "",
  );
  const [benefits, setBenefits] = useState(
    level?.benefits != null ? JSON.stringify(level.benefits, null, 2) : "",
  );
  const [benefitsError, setBenefitsError] = useState(false);
  const [badgeIcon, setBadgeIcon] = useState(level?.badgeIcon ?? "");

  const backHref =
    mode === "edit" && level
      ? `/${lang}/seller-levels/${level.id}`
      : `/${lang}/seller-levels`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBenefitsError(false);

    let parsedBenefits: unknown;
    if (benefits.trim()) {
      try {
        parsedBenefits = JSON.parse(benefits);
      } catch {
        setBenefitsError(true);
        return;
      }
    }

    const input = {
      levelName,
      minPoints: Number(minPoints) || 0,
      maxPoints: maxPoints.trim() ? Number(maxPoints) : undefined,
      benefits: parsedBenefits,
      badgeIcon: badgeIcon.trim() || undefined,
    };

    if (mode === "create") {
      const ok = await createLevel(input);
      if (ok) navigateTo({ route: `/${lang}/seller-levels` });
    } else if (level) {
      const ok = await updateLevel(level.id, input);
      if (ok) navigateTo({ route: `/${lang}/seller-levels/${level.id}` });
    }
  };

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      <FormShell
        backHref={backHref}
        backLabel={t("detail.back")}
        title={mode === "create" ? t("form.createTitle") : t("form.editTitle")}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-border-light bg-surface p-5 shadow-sm"
        >
          <Input
            name="levelName"
            label={t("form.levelName")}
            value={levelName}
            onChangeText={setLevelName}
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              name="minPoints"
              type="number"
              label={t("form.minPoints")}
              value={minPoints}
              onChangeText={setMinPoints}
              required
            />
            <Input
              name="maxPoints"
              type="number"
              label={t("form.maxPoints")}
              value={maxPoints}
              onChangeText={setMaxPoints}
            />
          </div>
          <Textarea
            name="benefits"
            label={t("form.benefits")}
            value={benefits}
            onChangeText={setBenefits}
            rows={6}
            hint={t("form.benefitsHint")}
            hasError={benefitsError}
            errorMessage={t("form.benefitsInvalid")}
          />
          <Input
            name="badgeIcon"
            label={t("form.badgeIcon")}
            value={badgeIcon}
            onChangeText={setBadgeIcon}
          />
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
