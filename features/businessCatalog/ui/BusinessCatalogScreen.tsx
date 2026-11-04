"use client";

import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { Search } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import MainButton from "@/components/Button/MainButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useBusinessKinds } from "@/features/businessPublish/hooks/useBusinessKinds";
import { KindSwitch } from "@/features/businessPublish/ui/KindSwitch";
import { useTranslation } from "@/i18n/context";
import { useBusinessCatalog } from "../hooks/useBusinessCatalog";
import { NAMESPACE } from "../i18n";
import {
  CATALOG_FILTERS,
  type CatalogFilter,
  type CatalogItem,
  type CatalogKind,
} from "../types";
import { CatalogItemRow } from "./CatalogItemRow";

/** Listings drawn at a time; "Mostrar más" adds as many again. */
const STEP = 30;

const MATCHES: Record<CatalogFilter, (item: CatalogItem) => boolean> = {
  all: () => true,
  noPhoto: (item) => item.images.length === 0,
  hidden: (item) => !item.isActive,
};

function CatalogList({
  kind,
  lang,
  initialFilter,
}: {
  kind: CatalogKind;
  lang: SupportedLanguage;
  initialFilter: CatalogFilter;
}) {
  const { t } = useTranslation(NAMESPACE);
  const catalog = useBusinessCatalog(kind);
  const [filter, setFilter] = useState<CatalogFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(STEP);

  if (catalog.loadFailed) {
    return (
      <Text variant="p" color="secondary">
        {t("feedback.loadError")}
      </Text>
    );
  }
  if (catalog.loading || !catalog.items) {
    return <div className="h-40 animate-pulse rounded-lg bg-background-tertiary" />;
  }

  const items = catalog.items;
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-5">
        <Text variant="p" color="secondary">
          {t("feedback.empty")}
        </Text>
        <Link
          href={`/${lang}/business-publish`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {t("feedback.toPublish")}
        </Link>
      </div>
    );
  }

  const needle = search.trim().toLocaleLowerCase();
  const matching = items.filter(
    (item) =>
      MATCHES[filter](item) &&
      (!needle || item.name.toLocaleLowerCase().includes(needle)),
  );
  const visible = matching.slice(0, limit);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-1 self-start rounded-lg border border-border bg-surface p-1">
          {CATALOG_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setFilter(f);
                setLimit(STEP);
              }}
              className={clsx(
                "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                f === filter
                  ? "bg-primary text-on-primary"
                  : "text-foreground-secondary hover:bg-background-tertiary",
              )}
            >
              {t(`filters.${f}`, { count: String(items.filter(MATCHES[f]).length) })}
            </button>
          ))}
        </div>
        <div className="sm:w-72">
          <Input
            name="search"
            type="search"
            size="sm"
            leftIcon={Search}
            placeholder={t("filters.search")}
            aria-label={t("filters.search")}
            value={search}
            onChangeText={(value) => {
              setSearch(value);
              setLimit(STEP);
            }}
          />
        </div>
      </div>

      {matching.length === 0 ? (
        <Text variant="p" color="secondary">
          {t("feedback.noMatch")}
        </Text>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((item) => (
            <CatalogItemRow
              key={item.id}
              item={item}
              kind={kind}
              busy={catalog.busyId === item.id}
              onAddPhotos={(files) => void catalog.addPhotos(item, files)}
              onRemovePhoto={(key) => void catalog.removePhoto(item, key)}
              onSetCover={(key) => void catalog.setCover(item, key)}
              onSetVisible={(isActive) => void catalog.setVisible(item, isActive)}
            />
          ))}
        </ul>
      )}

      {matching.length > visible.length && (
        <div className="flex flex-wrap items-center gap-3">
          <MainButton
            text={t("feedback.more")}
            variant="secondary_outline"
            size="sm"
            onPress={() => setLimit((n) => n + STEP)}
          />
          <Text variant="small" color="tertiary">
            {t("feedback.showing", {
              count: String(visible.length),
              total: String(matching.length),
            })}
          </Text>
        </div>
      )}
    </div>
  );
}

/**
 * Business area → Catálogo y fotos (ADM-16). A spreadsheet can't carry
 * photos, and a store product without one stays hidden, so this is where a
 * business adds them, picks the cover and turns its listings on and off,
 * without going to the web.
 */
export function BusinessCatalogScreen({
  lang,
  initialFilter,
}: {
  lang: SupportedLanguage;
  initialFilter: CatalogFilter;
}) {
  const { t } = useTranslation(NAMESPACE);
  const { sellerId, kinds, loading } = useBusinessKinds();
  const [picked, setPicked] = useState<CatalogKind | null>(null);
  const kind = picked && kinds.includes(picked) ? picked : kinds[0];

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
          {/* Keyed by kind so switching loads the other catalog afresh. */}
          <CatalogList key={kind} kind={kind} lang={lang} initialFilter={initialFilter} />
        </>
      )}
    </div>
  );
}
