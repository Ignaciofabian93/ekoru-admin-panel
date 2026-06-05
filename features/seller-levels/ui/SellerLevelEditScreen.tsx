"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import { useSellerLevelDetail } from "../hooks/useSellerLevelDetail";
import { SellerLevelForm } from "./SellerLevelForm";

export function SellerLevelEditScreen({
  id,
  lang,
}: {
  id: number;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("sellerLevels");
  const { t: tc } = useTranslation();
  const { level, loading } = useSellerLevelDetail(id);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {tc("common.loading")}
        </Text>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {t("detail.notFound")}
        </Text>
      </div>
    );
  }

  return <SellerLevelForm mode="edit" lang={lang} level={level} />;
}
