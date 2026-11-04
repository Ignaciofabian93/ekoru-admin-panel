"use client";

import { useState } from "react";
import clsx from "clsx";
import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { NAMESPACE } from "../i18n";
import { BookingsTab } from "./BookingsTab";
import { QuotationsTab } from "./QuotationsTab";

const TABS = ["bookings", "quotations"] as const;
type Tab = (typeof TABS)[number];

/**
 * Business area → Reservas y cotizaciones (USR-15): the service side of a
 * store's orders, for the owner or anyone with MANAGE_BUSINESS_ORDERS. The
 * team works as the provider, the same as on the web's "Servicios prestados"
 * and "Cotizaciones recibidas".
 */
export function BusinessServiceDeskScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation(NAMESPACE);
  const [tab, setTab] = useState<Tab>("bookings");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <Title level="h1" size="h3" weight="bold">
          {t("title")}
        </Title>
        <Text variant="p" color="secondary">
          {t("subtitle")}
        </Text>
      </header>

      <div className="flex gap-1 self-start rounded-lg border border-border bg-surface p-1">
        {TABS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={clsx(
              "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
              k === tab
                ? "bg-primary text-on-primary"
                : "text-foreground-secondary hover:bg-background-tertiary",
            )}
          >
            {t(`tabs.${k}`)}
          </button>
        ))}
      </div>

      {tab === "bookings" ? <BookingsTab lang={lang} /> : <QuotationsTab lang={lang} />}
    </div>
  );
}
