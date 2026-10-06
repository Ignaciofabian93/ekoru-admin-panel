"use client";

import { type SupportedLanguage } from "@/constants/settings";
import { Badge } from "@/components/Badge/Badge";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import type { BusinessApprovalStatus } from "@/types/enums";
import type { BusinessProfile } from "@/types/user";

export const APPROVAL_TONE: Record<
  BusinessApprovalStatus,
  "warning" | "success" | "danger"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

/**
 * What a business told EKORU at sign-up, and how the review ended. The reviewer
 * reads the message here before approving (after creating any missing category
 * or material) or rejecting with a reason that is emailed to the business.
 */
export function BusinessApplicationPanel({
  profile,
  lang,
}: {
  profile: BusinessProfile;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation("users");
  const status = profile.approvalStatus;

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-background-secondary p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Text variant="span" weight="semibold">
          {t("application.title")}
        </Text>
        {status && (
          <Badge tone={APPROVAL_TONE[status]}>{t(`approvalStatus.${status}`)}</Badge>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Text variant="small" color="tertiary">
          {t("application.message")}
        </Text>
        <Text variant="span" className="whitespace-pre-line">
          {profile.applicationMessage || t("application.noMessage")}
        </Text>
      </div>

      {status === "REJECTED" && profile.rejectionReason && (
        <div className="flex flex-col gap-1">
          <Text variant="small" color="tertiary">
            {t("application.rejectionReason")}
          </Text>
          <Text variant="span" className="whitespace-pre-line">
            {profile.rejectionReason}
          </Text>
        </div>
      )}

      {profile.reviewedAt && (
        <Text variant="small" color="tertiary">
          {t("application.reviewedAt", { date: formatDate(profile.reviewedAt, lang) })}
        </Text>
      )}

      {status === "PENDING" && (
        <Text variant="small" color="tertiary">
          {t("application.pendingHint")}
        </Text>
      )}
    </section>
  );
}
