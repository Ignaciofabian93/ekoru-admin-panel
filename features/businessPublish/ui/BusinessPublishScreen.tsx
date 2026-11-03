"use client";

import { useState } from "react";
import clsx from "clsx";
import { useQuery } from "@apollo/client/react";
import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { GET_SELLER } from "@/graphql/sellers/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useTranslation } from "@/i18n/context";
import { useScopedSellerId } from "@/store/useAuthStore";
import type { CatalogKind } from "../catalog";
import { NAMESPACE } from "../i18n";
import { CatalogPublishCard } from "./CatalogPublishCard";

/** What each business type publishes, as on the web (WEB-22). */
const KINDS_BY_TYPE: Record<string, CatalogKind[]> = {
  RETAIL: ["products"],
  SERVICES: ["services"],
  MIXED: ["products", "services"],
};

/**
 * Business area → Publicar por planilla (ADM-16), the paid panel's main draw
 * (USR-15): the whole catalog from one spreadsheet instead of one listing at a
 * time on the web. A MIXED business switches between its two catalogs.
 */
export function BusinessPublishScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation(NAMESPACE);
  const sellerId = useScopedSellerId();
  const language = useGqlLanguage();
  const { data, loading } = useQuery<{
    getSeller: { profile?: { businessType?: string | null } | null } | null;
  }>(GET_SELLER, { variables: { id: sellerId, language }, skip: !sellerId });

  const kinds = KINDS_BY_TYPE[data?.getSeller?.profile?.businessType ?? ""] ?? [];
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
      ) : loading && !data ? (
        <div className="h-40 animate-pulse rounded-lg bg-background-tertiary" />
      ) : !kind ? (
        <Text variant="p" color="secondary">
          {t("feedback.noKinds")}
        </Text>
      ) : (
        <>
          {kinds.length > 1 && (
            <div className="flex gap-1 self-start rounded-lg border border-border bg-surface p-1">
              {kinds.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setPicked(k)}
                  className={clsx(
                    "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
                    k === kind
                      ? "bg-primary text-white"
                      : "text-foreground-secondary hover:bg-background-tertiary",
                  )}
                >
                  {t(`kinds.${k}`)}
                </button>
              ))}
            </div>
          )}
          {/* Keyed by kind so switching starts a fresh flow. */}
          <CatalogPublishCard key={kind} kind={kind} lang={lang} />
        </>
      )}
    </div>
  );
}
