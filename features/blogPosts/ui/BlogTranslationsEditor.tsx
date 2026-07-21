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
  type BlogPostTranslation,
  type CatalogLanguage,
} from "../types";

export type BlogTranslationSavePayload = {
  language: CatalogLanguage;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
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
  existing: BlogPostTranslation | null;
  saving: boolean;
  onSave: (payload: BlogTranslationSavePayload) => Promise<unknown>;
  onDelete: (language: CatalogLanguage) => Promise<unknown>;
}) {
  const { t } = useTranslation("blogPosts");

  const [title, setTitle] = useState(existing?.title ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [content, setContent] = useState(existing?.content ?? "");
  const [excerpt, setExcerpt] = useState(existing?.excerpt ?? "");
  const [metaTitle, setMetaTitle] = useState(existing?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(existing?.metaDescription ?? "");
  const [metaKeywords, setMetaKeywords] = useState(
    (existing?.metaKeywords ?? []).join(" | "),
  );

  const canSave = title.trim() && slug.trim() && content.trim();

  const save = () => {
    if (!canSave) return;
    void onSave({
      language: code,
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: excerpt.trim() || null,
      metaTitle: metaTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      metaKeywords: splitList(metaKeywords),
    });
  };

  const remove = () => {
    if (!existing) return;
    if (!window.confirm(t("translations.deleteConfirm"))) return;
    void onDelete(code);
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
          name={`tr-title-${code}`}
          label={t("fields.title")}
          value={title}
          onChangeText={setTitle}
        />
        <Input
          name={`tr-slug-${code}`}
          label={t("fields.slug")}
          value={slug}
          onChangeText={setSlug}
        />
      </div>
      <Textarea
        name={`tr-content-${code}`}
        label={t("fields.content")}
        value={content}
        onChangeText={setContent}
        rows={6}
      />
      <Textarea
        name={`tr-excerpt-${code}`}
        label={t("fields.excerpt")}
        value={excerpt}
        onChangeText={setExcerpt}
        rows={2}
      />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <Input
          name={`tr-metaTitle-${code}`}
          label={t("fields.metaTitle")}
          value={metaTitle}
          onChangeText={setMetaTitle}
        />
        <Input
          name={`tr-metaKeywords-${code}`}
          label={t("fields.metaKeywords")}
          placeholder={t("fields.listHint")}
          value={metaKeywords}
          onChangeText={setMetaKeywords}
        />
      </div>
      <Textarea
        name={`tr-metaDescription-${code}`}
        label={t("fields.metaDescription")}
        value={metaDescription}
        onChangeText={setMetaDescription}
        rows={2}
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
 * Per-language editor for a blog post's translations. One card per backend
 * language; saving upserts that single translation, deleting removes it.
 */
export function BlogTranslationsEditor({
  translations,
  saving,
  onSave,
  onDelete,
}: {
  translations: BlogPostTranslation[];
  saving: boolean;
  onSave: (payload: BlogTranslationSavePayload) => Promise<unknown>;
  onDelete: (language: CatalogLanguage) => Promise<unknown>;
}) {
  const { t } = useTranslation("blogPosts");

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
              key={`${code}-${existing?.id ?? "new"}`}
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
