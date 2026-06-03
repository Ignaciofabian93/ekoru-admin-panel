"use client";

import { Badge } from "@/components/Badge/Badge";
import { useTranslation } from "@/i18n/context";
import type { Seller } from "@/types/user";

export function SellerStatusBadges({ seller }: { seller: Seller }) {
  const { t } = useTranslation();
  return (
    <span className="flex flex-wrap gap-1.5">
      <Badge tone={seller.isActive ? "success" : "neutral"}>
        {seller.isActive ? t("common.active") : t("common.inactive")}
      </Badge>
      {seller.isVerified && <Badge tone="info">{t("common.verified")}</Badge>}
    </span>
  );
}
