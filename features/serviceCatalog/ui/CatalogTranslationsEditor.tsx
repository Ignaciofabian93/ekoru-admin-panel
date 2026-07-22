"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import MainButton from "@/components/Button/MainButton";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { Textarea } from "@/components/Textarea/Textarea";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import {
  CATALOG_LANGUAGES,
  type CatalogLanguage,
  type CatalogTranslation,
} from "../types";

/** What the editor hands back on save; the parent id is added by the caller. */
export type CatalogTranslationSavePayload = {
  id?: number;
  language: CatalogLanguage;
  name: string;
  slug: string;
  href: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
};

const splitList = (value: string) =>
  value
    .split(/[|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

function TranslationCard({
  code,
  existing,
  saving,
  onSave,
  onDelete,
}: {
  code: CatalogLanguage;
  existing: CatalogTranslation | null;
  saving: boolean;
  onSave: (payload: CatalogTranslationSavePayload) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}) {
  const { t } = useTranslation("serviceCatalog");

  const [name, setName] = useState(existing?.name ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [href, setHref] = useState(existing?.href ?? "");
  const [metaTitle, setMetaTitle] = useState(existing?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(existing?.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords] = useState(
    (existing?.metaKeywords ?? []).join(" | "),
  );

  const canSave = !!name.trim() && !!slug.trim();

  const save = () => {
    if (!canSave) return;
    void onSave({
      id: existing?.id,
      language: code,
      name: name.trim(),
      slug: slug.trim(),
      href: href.trim() || null,
      metaTitle: metaTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      metaKeywords: splitList(metaKeywords),
    });
  };

  const remove = () => {
    if (!existing) return;
    if (!window.confirm(t("translations.deleteConfirm"))) return;
    void onDelete(existing.id);
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-light p-3">
      <div className="flex items-center justify-between">
        <Text variant="small" color="tertiary" weight="semibold">
          {code}
          {existing ? ` · #${existing.id}` : ` · ${t("translations.missing")}`}
        </Text>
        {existing && (
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("translations.delete")}
            disabled={saving}
            onClick={remove}
          />
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Input
          name={`tr-name-${code}`}
          label={t("fields.name")}
          value={name}
          onChangeText={setName}
        />
        <Input
          name={`tr-slug-${code}`}
          label={t("fields.slug")}
          value={slug}
          onChangeText={setSlug}
        />
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Input
          name={`tr-href-${code}`}
          label={t("fields.href")}
          value={href}
          onChangeText={setHref}
        />
        <Input
          name={`tr-metaTitle-${code}`}
          label={t("fields.metaTitle")}
          value={metaTitle}
          onChangeText={setMetaTitle}
        />
      </div>
      <Textarea
        name={`tr-metaDescription-${code}`}
        label={t("fields.metaDescription")}
        value={metaDescription}
        onChangeText={setMetaDescription}
        rows={2}
      />
      <Input
        name={`tr-metaKeywords-${code}`}
        label={t("fields.metaKeywords")}
        placeholder={t("fields.listHint")}
        value={metaKeywords}
        onChangeText={setMetaKeywords}
      />
      <div className="flex justify-end">
        <MainButton
          text={t("translations.save")}
          size="sm"
          loading={saving}
          disabled={!canSave}
          onPress={save}
        />
      </div>
    </div>
  );
}

/**
 * Per-language editor for a service catalog row's translations. One card per
 * backend language (ES/EN/FR/PT/DE); saving upserts that single translation,
 * deleting removes just that language row.
 */
export function CatalogTranslationsEditor({
  translations,
  saving,
  onSave,
  onDelete,
}: {
  translations: CatalogTranslation[];
  saving: boolean;
  onSave: (payload: CatalogTranslationSavePayload) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}) {
  const { t } = useTranslation("serviceCatalog");

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <Title level="h2" size="h6" weight="semibold">
        {t("translations.title")}
      </Title>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {CATALOG_LANGUAGES.map((code) => {
          const existing = translations.find((tr) => tr.language === code) ?? null;
          return (
            <TranslationCard
              key={`${code}-${existing?.id ?? "new"}-${existing?.name ?? ""}`}
              code={code}
              existing={existing}
              saving={saving}
              onSave={onSave}
              onDelete={onDelete}
            />
          );
        })}
      </div>
    </section>
  );
}
