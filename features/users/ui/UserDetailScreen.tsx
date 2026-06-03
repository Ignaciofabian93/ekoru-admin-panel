"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import { useSellerDetail } from "../hooks/useSellerDetail";
import { SellerDetailCard } from "./SellerDetailCard";

export function UserDetailScreen({ id, lang }: { id: string; lang: SupportedLanguage }) {
  const { t } = useTranslation("users");
  const { t: tc } = useTranslation();
  const { seller, loading, refetch } = useSellerDetail(id);

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_USERS"
      fallback={<AccessDenied />}
    >
      {loading && (
        <div className="py-20 text-center">
          <Text variant="p" color="tertiary">
            {tc("common.loading")}
          </Text>
        </div>
      )}

      {!loading && !seller && (
        <div className="py-20 text-center">
          <Text variant="p" color="tertiary">
            {t("detail.notFound")}
          </Text>
        </div>
      )}

      {!loading && seller && (
        <SellerDetailCard seller={seller} lang={lang} onChanged={() => refetch()} />
      )}
    </PermissionGate>
  );
}
