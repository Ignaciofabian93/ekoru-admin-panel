"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import { useAdminDetail } from "../hooks/useAdminDetail";
import { AdminForm } from "./AdminForm";

export function AdminEditScreen({ id, lang }: { id: string; lang: SupportedLanguage }) {
  const { t } = useTranslation("admins");
  const { t: tc } = useTranslation();
  const { admin, loading } = useAdminDetail(id);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {tc("common.loading")}
        </Text>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {t("detail.notFound")}
        </Text>
      </div>
    );
  }

  return <AdminForm mode="edit" lang={lang} admin={admin} />;
}
