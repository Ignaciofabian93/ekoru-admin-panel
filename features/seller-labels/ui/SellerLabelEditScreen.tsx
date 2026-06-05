"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import { useSellerLabelDetail } from "../hooks/useSellerLabelDetail";
import { SellerLabelForm } from "./SellerLabelForm";

export function SellerLabelEditScreen({
  id,
  lang,
}: {
  id: number;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("sellerLabels");
  const { t: tc } = useTranslation();
  const { label, loading } = useSellerLabelDetail(id);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {tc("common.loading")}
        </Text>
      </div>
    );
  }

  if (!label) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {t("detail.notFound")}
        </Text>
      </div>
    );
  }

  return <SellerLabelForm mode="edit" lang={lang} label={label} />;
}
