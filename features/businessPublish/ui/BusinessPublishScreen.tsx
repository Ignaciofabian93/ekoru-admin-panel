"use client";

import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import type { CatalogKind } from "../catalog";
import { useBusinessKinds } from "../hooks/useBusinessKinds";
import { NAMESPACE } from "../i18n";
import { CatalogPublishCard } from "./CatalogPublishCard";
import { KindSwitch } from "./KindSwitch";

/**
 * Business area → Publicar por planilla (ADM-16), the paid panel's main draw
 * (USR-15): the whole catalog from one spreadsheet instead of one listing at a
 * time on the web. A MIXED business switches between its two catalogs.
 */
export function BusinessPublishScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation(NAMESPACE);
  const { sellerId, kinds, loading } = useBusinessKinds();
  const [picked, setPicked] = useState<CatalogKind | null>(null);
  const kind = picked && kinds.includes(picked) ? picked : kinds[0];

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Title level="h1" size="h3" weight="bold">
          {t("title")}
        </Title>
        <Text variant="p" color="secondary">
          {t("subtitle")}
        </Text>
      </header>

      {!sellerId ? (
        <Text variant="p" color="secondary">
          {t("feedback.notBusiness")}
        </Text>
      ) : loading ? (
        <div className="h-40 animate-pulse rounded-lg bg-background-tertiary" />
      ) : !kind ? (
        <Text variant="p" color="secondary">
          {t("feedback.noKinds")}
        </Text>
      ) : (
        <>
          <KindSwitch
            kinds={kinds}
            value={kind}
            onChange={setPicked}
            label={(k) => t(`kinds.${k}`)}
          />
          {/* Keyed by kind so switching starts a fresh flow. */}
          <CatalogPublishCard key={kind} kind={kind} lang={lang} />
        </>
      )}
    </div>
  );
}
