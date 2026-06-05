"use client";

import { Pencil, Trash2 } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { FormShell } from "@/components/FormShell/FormShell";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useSellerLabelDetail } from "../hooks/useSellerLabelDetail";
import { useSellerLabelMutations } from "../hooks/useSellerLabelMutations";
import { LabelTranslations } from "./LabelTranslations";

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

export function SellerLabelDetailScreen({
  id,
  lang,
}: {
  id: number;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("sellerLabels");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { label, loading, refetch } = useSellerLabelDetail(id);
  const { deleteLabel, loading: mutating } = useSellerLabelMutations();

  const handleDelete = async () => {
    if (!label || !window.confirm(t("detail.deleteConfirm"))) return;
    const ok = await deleteLabel(label.id);
    if (ok) navigateTo({ route: `/${lang}/seller-labels` });
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

      {!loading && !label && (
        <div className="py-20 text-center">
          <Text variant="p" color="tertiary">
            {t("detail.notFound")}
          </Text>
        </div>
      )}

      {!loading && label && (
        <FormShell
          backHref={`/${lang}/seller-labels`}
          backLabel={t("detail.back")}
          title={label.labelName}
          actions={
            <div className="flex gap-2">
              <MainButton
                text={t("detail.edit")}
                variant="secondary_outline"
                size="sm"
                leftIcon={Pencil}
                onPress={() =>
                  navigateTo({ route: `/${lang}/seller-labels/${label.id}/edit` })
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
            <div className="flex flex-col gap-0.5">
              <Text variant="small" color="tertiary">
                {t("table.transactionKind")}
              </Text>
              <Badge tone="primary">
                {t(`transactionKind.${label.transactionKind}`)}
              </Badge>
            </div>
            <Field
              label={t("table.required")}
              value={String(label.transactionsRequired)}
            />
            <Field label={t("form.description")} value={label.description} />
            <Field label={t("form.badgeIcon")} value={label.badgeIcon} />
          </section>

          <LabelTranslations label={label} onChanged={() => refetch()} />
        </FormShell>
      )}
    </PermissionGate>
  );
}
