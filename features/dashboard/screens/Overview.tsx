"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { useAdmin, useDisplayName, useIsPlatformAdmin } from "@/store/useAuthStore";
import { filterNav } from "../constants/nav";

export function Overview({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("dashboard");
  const { t: tn } = useTranslation();
  const admin = useAdmin();
  const displayName = useDisplayName();
  const isPlatform = useIsPlatformAdmin();

  // Section cards mirror the sidebar — they only show what this admin may open,
  // which makes the PLATFORM vs BUSINESS scope visible at a glance.
  const cards = filterNav(admin)
    .flatMap((section) => section.items)
    .filter((item) => item.to !== "");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Title level="h1" size="h3" weight="bold">
          {t("greeting", { name: displayName })}
        </Title>
        <Text variant="p" color="secondary">
          {isPlatform ? t("overview.platformSubtitle") : t("overview.businessSubtitle")}
        </Text>
      </header>

      <div className="rounded-lg border border-border-light bg-primary-light-bg p-4">
        <Text variant="p" color="primaryDark">
          {isPlatform ? t("overview.platformIntro") : t("overview.businessIntro")}
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.labelKey}
              href={`/${lang}/${item.to}`}
              className="group flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm transition-colors hover:border-primary-light"
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-primary-light-bg text-primary-active">
                <Icon size={20} strokeWidth={2} />
              </span>
              <Text variant="span" weight="semibold">
                {tn(`nav.${item.labelKey}`)}
              </Text>
              <span className="flex items-center gap-1 font-sans text-sm font-medium text-primary">
                {t("overview.openSection")}
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
