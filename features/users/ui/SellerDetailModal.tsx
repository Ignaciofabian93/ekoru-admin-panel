"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { Badge } from "@/components/Badge/Badge";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { resolveImageUrl } from "@/utils/imageUrl";
import type { Seller } from "@/types/user";
import { sellerDisplayName } from "../types";
import { SellerActions } from "./SellerActions";
import { SellerStatusBadges } from "./SellerStatusBadges";

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

/** Avatar that falls back to initials when there's no image or it fails to load. */
function Avatar({ src, name }: { src?: string | null; name: string }) {
  const [errored, setErrored] = useState(false);
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "—";

  if (!src || errored) {
    return (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-light-bg font-sans text-lg font-semibold text-primary">
        {initials}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={name}
      width={56}
      height={56}
      className="size-14 shrink-0 rounded-full object-cover"
      onError={() => setErrored(true)}
    />
  );
}

/** Profile image is the person's photo or the business logo, whichever exists. */
function profileImageUrl(seller: Seller): string | null {
  const profile = seller.profile;
  const ref =
    profile?.__typename === "PersonProfile"
      ? profile.profileImage
      : profile?.__typename === "BusinessProfile"
        ? profile.logo
        : null;
  return resolveImageUrl(ref);
}

/** Joins the resolved location names into a single readable line. */
function locationLine(seller: Seller): string {
  return (
    [
      seller.city?.city,
      seller.county?.county,
      seller.region?.region,
      seller.country?.country,
    ]
      .filter(Boolean)
      .join(", ") || ""
  );
}

/**
 * Detail dialog opened from a seller row. Seeds from the full node the admin
 * list already returns (the single-seller query is seller-gated and unusable
 * for admins) and updates in place from each mutation result, while `onRefetch`
 * keeps the underlying table row in sync.
 */
export function SellerDetailModal({
  seller,
  lang,
  onClose,
  onRefetch,
}: {
  seller: Seller;
  lang: SupportedLanguage;
  onClose: () => void;
  onRefetch: () => void;
}) {
  const { t } = useTranslation("users");
  const { t: tc } = useTranslation();
  // Seeded from the row; the host remounts (via key) when another row opens.
  const [view, setView] = useState<Seller>(seller);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const profile = view.profile;

  const handleChanged = (updated: Seller) => {
    setView((prev) => ({ ...prev, ...updated }));
    onRefetch();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl animate-modal-pop flex-col overflow-hidden rounded-lg bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border-light p-6">
          <div className="flex items-start gap-3">
            <Avatar src={profileImageUrl(view)} name={sellerDisplayName(view)} />
            <div className="flex flex-col gap-1">
              <Title level="h2" size="h5" weight="bold">
                {sellerDisplayName(view)}
              </Title>
              <Text variant="span" color="secondary">
                {view.email}
              </Text>
              <span className="mt-1 flex flex-wrap items-center gap-1.5">
                <SellerStatusBadges seller={view} />
                <Badge tone="neutral">{t(`sellerType.${view.sellerType}`)}</Badge>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tc("common.cancel")}
            className="flex cursor-pointer items-center rounded-md p-1 text-foreground-tertiary transition-colors hover:bg-surface-hover"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t("table.points")} value={String(view.points ?? 0)} />
            <Field label={t("table.joined")} value={formatDate(view.createdAt, lang)} />
            <Field label={t("detail.contact")} value={view.phone} />
            <Field label="Website" value={view.website} />
            <Field
              label={t("detail.contactMethod")}
              value={view.preferredContactMethod}
            />
            <Field label={t("detail.location")} value={locationLine(view)} />
          </section>

          {profile && (
            <section className="grid grid-cols-1 gap-4 rounded-lg border border-border-light bg-background-secondary p-4 sm:grid-cols-2">
              {profile.__typename === "PersonProfile" && (
                <>
                  <Field label={t("detail.displayName")} value={profile.displayName} />
                  <Field label={t("detail.bio")} value={profile.bio} />
                </>
              )}
              {profile.__typename === "BusinessProfile" && (
                <>
                  <Field label={t("detail.businessName")} value={profile.businessName} />
                  <Field label={t("detail.taxId")} value={profile.taxId} />
                  <Field label={t("detail.businessType")} value={profile.businessType} />
                  <Field label={t("detail.description")} value={profile.description} />
                </>
              )}
            </section>
          )}
        </div>

        {/* Actions footer */}
        <div className="border-t border-border-light p-6">
          <SellerActions seller={view} onChanged={handleChanged} />
        </div>
      </div>
    </div>
  );
}
