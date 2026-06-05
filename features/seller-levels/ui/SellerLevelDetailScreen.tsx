"use client";

import { Pencil, Trash2 } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { FormShell } from "@/components/FormShell/FormShell";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useSellerLevelDetail } from "../hooks/useSellerLevelDetail";
import { useSellerLevelMutations } from "../hooks/useSellerLevelMutations";
import { LevelTranslations } from "./LevelTranslations";

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

export function SellerLevelDetailScreen({
  id,
  lang,
}: {
  id: number;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("sellerLevels");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { level, loading, refetch } = useSellerLevelDetail(id);
  const { deleteLevel, loading: mutating } = useSellerLevelMutations();

  const handleDelete = async () => {
    if (!level || !window.confirm(t("detail.deleteConfirm"))) return;
    const ok = await deleteLevel(level.id);
    if (ok) navigateTo({ route: `/${lang}/seller-levels` });
  };

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      {loading && (
        <div className="py-20 text-center">
          <Text variant="p" color="tertiary">
            {tc("common.loading")}
          </Text>
        </div>
      )}

      {!loading && !level && (
        <div className="py-20 text-center">
          <Text variant="p" color="tertiary">
            {t("detail.notFound")}
          </Text>
        </div>
      )}

      {!loading && level && (
        <FormShell
          backHref={`/${lang}/seller-levels`}
          backLabel={t("detail.back")}
          title={level.levelName}
          actions={
            <div className="flex gap-2">
              <MainButton
                text={t("detail.edit")}
                variant="secondary_outline"
                size="sm"
                leftIcon={Pencil}
                onPress={() =>
                  navigateTo({ route: `/${lang}/seller-levels/${level.id}/edit` })
                }
              />
              <MainButton
                text={t("detail.delete")}
                variant="error"
                size="sm"
                leftIcon={Trash2}
                loading={mutating}
                onPress={handleDelete}
              />
            </div>
          }
        >
          <section className="grid grid-cols-1 gap-4 rounded-lg border border-border-light bg-surface p-5 shadow-sm sm:grid-cols-2">
            <Field label={t("form.minPoints")} value={String(level.minPoints)} />
            <Field
              label={t("form.maxPoints")}
              value={level.maxPoints != null ? String(level.maxPoints) : "—"}
            />
            <Field label={t("form.badgeIcon")} value={level.badgeIcon} />
          </section>

          {level.benefits != null && (
            <section className="flex flex-col gap-2 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
              <Text variant="small" color="tertiary">
                {t("detail.benefits")}
              </Text>
              <pre className="overflow-x-auto rounded-md bg-background-secondary p-3 font-mono text-xs text-foreground">
                {JSON.stringify(level.benefits, null, 2)}
              </pre>
            </section>
          )}

          <LevelTranslations level={level} onChanged={() => refetch()} />
        </FormShell>
      )}
    </PermissionGate>
  );
}
