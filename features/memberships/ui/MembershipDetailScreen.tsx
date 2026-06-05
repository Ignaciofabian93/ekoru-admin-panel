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
import { humanizeEnum } from "@/utils/formatters";
import { useMembershipDetail } from "../hooks/useMemberships";
import { useMembershipMutations } from "../hooks/useMembershipMutations";
import { MembershipPricing } from "./MembershipPricing";
import { MembershipTranslations } from "./MembershipTranslations";
import type { MembershipKind } from "../types";

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

export function MembershipDetailScreen({
  kind,
  id,
  lang,
}: {
  kind: MembershipKind;
  id: number;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("memberships");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { membership, loading } = useMembershipDetail(kind, id);
  const { remove, loading: mutating } = useMembershipMutations(kind);

  const handleDelete = async () => {
    if (!membership || !window.confirm(t("detail.deleteConfirm"))) return;
    const ok = await remove(membership.id);
    if (ok) navigateTo({ route: `/${lang}/memberships` });
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

      {!loading && !membership && (
        <div className="py-20 text-center">
          <Text variant="p" color="tertiary">
            {t("detail.notFound")}
          </Text>
        </div>
      )}

      {!loading && membership && (
        <FormShell
          backHref={`/${lang}/memberships`}
          backLabel={t("detail.back")}
          title={membership.translation?.name || humanizeEnum(membership.membershipType)}
          subtitle={t(`kind.${kind}`)}
          actions={
            <div className="flex items-center gap-2">
              <Badge tone={membership.isActive ? "success" : "neutral"}>
                {membership.isActive ? t("active") : t("inactive")}
              </Badge>
              <MainButton
                text={t("detail.edit")}
                variant="secondary_outline"
                size="sm"
                leftIcon={Pencil}
                onPress={() =>
                  navigateTo({
                    route: `/${lang}/memberships/${kind}/${membership.id}/edit`,
                  })
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
          <section className="grid grid-cols-1 gap-4 rounded-lg border border-border-light bg-surface p-5 shadow-sm sm:grid-cols-3">
            <Field
              label={t("table.type")}
              value={humanizeEnum(membership.membershipType)}
            />
            <Field
              label={t("table.duration")}
              value={String(membership.durationMonths)}
            />
            <Field
              label={t("table.status")}
              value={membership.isActive ? t("active") : t("inactive")}
            />
          </section>

          <MembershipTranslations kind={kind} membershipId={membership.id} />
          <MembershipPricing kind={kind} membershipId={membership.id} />
        </FormShell>
      )}
    </PermissionGate>
  );
}
