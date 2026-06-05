"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import { useMembershipDetail } from "../hooks/useMemberships";
import { MembershipForm } from "./MembershipForm";
import type { MembershipKind } from "../types";

export function MembershipEditScreen({
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
  const { membership, loading } = useMembershipDetail(kind, id);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {tc("common.loading")}
        </Text>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {t("detail.notFound")}
        </Text>
      </div>
    );
  }

  return <MembershipForm kind={kind} mode="edit" lang={lang} membership={membership} />;
}
