"use client";

import { Badge } from "@/components/Badge/Badge";
import { useTranslation } from "@/i18n/context";
import type { Seller } from "@/types/user";
import { APPROVAL_TONE } from "./BusinessApplicationPanel";

export function SellerStatusBadges({ seller }: { seller: Seller }) {
  const { t } = useTranslation();
  const { t: tu } = useTranslation("users");
  // Approved is the normal state; only flag a business still under review or turned down.
  const review =
    seller.profile?.__typename === "BusinessProfile"
      ? seller.profile.approvalStatus
      : undefined;
  return (
    <span className="flex flex-wrap gap-1.5">
      <Badge tone={seller.isActive ? "success" : "neutral"}>
        {seller.isActive ? t("common.active") : t("common.inactive")}
      </Badge>
      {seller.isVerified && <Badge tone="info">{t("common.verified")}</Badge>}
      {review && review !== "APPROVED" && (
        <Badge tone={APPROVAL_TONE[review]}>{tu(`approvalStatus.${review}`)}</Badge>
      )}
    </span>
  );
}
