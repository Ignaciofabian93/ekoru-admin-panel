"use client";

import { BadgeCheck, Boxes, Mail, MapPin, Phone, Wrench } from "lucide-react";
import Link from "next/link";
import { type SupportedLanguage } from "@/constants/settings";
import { Badge } from "@/components/Badge/Badge";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { useMyBusiness } from "../hooks/useMyBusiness";
import { NAMESPACE } from "../i18n";

/** Display name for whichever profile shape the seller carries. */
function businessName(
  profile: { __typename?: string; businessName?: string; firstName?: string } | null,
): string | null {
  if (!profile) return null;
  return profile.businessName ?? profile.firstName ?? null;
}

export function MyBusinessScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation(NAMESPACE);
  const { sellerId, seller, loading, storeProductCount, serviceCount } = useMyBusiness();

  // Only a BUSINESS admin has a seller behind them. The nav already hides this
  // page from platform admins; this covers a direct URL hit.
  if (!sellerId) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-2">
        <Title level="h1" size="h3" weight="bold">
          {t("title")}
        </Title>
        <Text variant="p" color="secondary">
          {t("notBusinessAdmin")}
        </Text>
      </div>
    );
  }

  const profile = seller?.profile ?? null;
  const name = businessName(profile) ?? seller?.email ?? "—";
  const location = [seller?.county?.county, seller?.city?.city, seller?.country?.country]
    .filter(Boolean)
    .join(", ");

  const shortcuts = [
    {
      key: "storeProducts",
      to: "store-products",
      icon: Boxes,
      count: storeProductCount,
    },
    { key: "services", to: "services", icon: Wrench, count: serviceCount },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Title level="h1" size="h3" weight="bold">
          {t("title")}
        </Title>
        <Text variant="p" color="secondary">
          {t("subtitle")}
        </Text>
      </header>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
        {loading ? (
          <div className="h-24 animate-pulse rounded-md bg-background-tertiary" />
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <Title level="h2" size="h5" weight="semibold">
                  {name}
                </Title>
                <Text variant="span" size="sm" color="secondary">
                  {t(`sellerTypes.${seller?.sellerType ?? "COMPANY"}`)}
                </Text>
              </div>
              {seller?.isVerified && (
                <Badge tone="success">
                  <span className="flex items-center gap-1">
                    <BadgeCheck size={14} />
                    {t("verified")}
                  </span>
                </Badge>
              )}
            </div>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-foreground-tertiary" />
                <Text variant="span" size="sm">
                  {seller?.email ?? "—"}
                </Text>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-foreground-tertiary" />
                <Text variant="span" size="sm">
                  {seller?.phone ?? t("noPhone")}
                </Text>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin size={16} className="text-foreground-tertiary" />
                <Text variant="span" size="sm">
                  {location || t("noLocation")}
                </Text>
              </div>
            </dl>

            <Text variant="small" color="secondary">
              {t("editElsewhere")}
            </Text>
          </>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <Link
              key={shortcut.key}
              href={`/${lang}/${shortcut.to}`}
              className="flex items-center gap-4 rounded-lg border border-border bg-surface p-5 transition-colors hover:border-primary"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-background-tertiary text-foreground-secondary">
                <Icon size={20} />
              </span>
              <div className="flex flex-col">
                <Title level="h2" size="h4" weight="bold">
                  {shortcut.count}
                </Title>
                <Text variant="span" size="sm" color="secondary">
                  {t(`shortcuts.${shortcut.key}`)}
                </Text>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
