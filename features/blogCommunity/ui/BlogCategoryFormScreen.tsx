"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { FormShell } from "@/components/FormShell/FormShell";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useBlogCommunityMutations } from "../hooks/useBlogCommunityMutations";
import { useRawBlogCategory } from "../hooks/useRawBlogCommunityCatalog";
import { catalogPaths } from "../paths";
import type { RawBlogCategory } from "../types";
import {
  CatalogTranslationsEditor,
  type CatalogTranslationSavePayload,
} from "./CatalogTranslationsEditor";

const toDateInput = (iso: string | null | undefined) => (iso ?? "").slice(0, 10);
const fromDateInput = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

function BlogCategoryForm({
  lang,
  row,
  onSaved,
}: {
  lang: SupportedLanguage;
  row: RawBlogCategory | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("blogCommunity");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const {
    loading,
    upsertBlogCategories,
    upsertBlogCategoryTranslations,
    removeBlogCategory,
    removeBlogCategoryTranslation,
  } = useBlogCommunityMutations();

  const [icon, setIcon] = useState(row?.icon ?? "");
  const [isActive, setIsActive] = useState(row?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(row?.sortOrder ?? 0));
  const [featuredFrom, setFeaturedFrom] = useState(toDateInput(row?.featuredFrom));
  const [featuredUntil, setFeaturedUntil] = useState(toDateInput(row?.featuredUntil));

  const saveBase = async () => {
    if (!icon.trim()) return;
    const result = await upsertBlogCategories([
      {
        ...(row ? { id: row.id } : {}),
        icon: icon.trim(),
        isActive,
        sortOrder: Number(sortOrder) || 0,
        featuredFrom: fromDateInput(featuredFrom),
        featuredUntil: fromDateInput(featuredUntil),
      },
    ]);
    if (!result || result.failed > 0) return;
    if (!row && result.createdIds[0] != null) {
      navigateTo({
        route: catalogPaths.blogCategoryEdit(lang, result.createdIds[0]),
      });
      return;
    }
    onSaved();
  };

  const saveTranslation = async (payload: CatalogTranslationSavePayload) => {
    if (!row) return;
    const result = await upsertBlogCategoryTranslations([
      { ...payload, blogCategoryId: row.id },
    ]);
    if (result && result.failed === 0) onSaved();
  };

  const deleteTranslation = async (id: number) => {
    if (await removeBlogCategoryTranslation(id)) onSaved();
  };

  const deleteRow = async () => {
    if (!row) return;
    if (!window.confirm(t("blogCategories.deleteConfirm"))) return;
    if (await removeBlogCategory(row.id)) {
      navigateTo({ route: catalogPaths.blogCategories(lang) });
    }
  };

  return (
    <FormShell
      backHref={catalogPaths.blogCategories(lang)}
      backLabel={t("actions.backToList")}
      title={
        row
          ? t("blogCategories.editTitle", { id: String(row.id) })
          : t("blogCategories.newTitle")
      }
      subtitle={t("blogCategories.formSubtitle")}
      actions={
        row ? (
          <MainButton
            text={tc("common.delete")}
            leftIcon={Trash2}
            variant="outline"
            size="sm"
            disabled={loading}
            onPress={deleteRow}
          />
        ) : undefined
      }
    >
      <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.baseData")}
        </Title>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            name="icon"
            label={t("fields.icon")}
            value={icon}
            onChangeText={setIcon}
          />
          <Input
            name="sortOrder"
            type="number"
            label={t("fields.sortOrder")}
            value={sortOrder}
            onChangeText={setSortOrder}
          />
          <div />
          <Input
            name="featuredFrom"
            type="date"
            label={t("fields.featuredFrom")}
            value={featuredFrom}
            onChangeText={setFeaturedFrom}
          />
          <Input
            name="featuredUntil"
            type="date"
            label={t("fields.featuredUntil")}
            value={featuredUntil}
            onChangeText={setFeaturedUntil}
          />
        </div>
        <Checkbox
          name="isActive"
          label={t("fields.isActive")}
          checked={isActive}
          onChange={setIsActive}
        />
        <div className="flex justify-end">
          <MainButton
            text={tc("common.save")}
            size="sm"
            loading={loading}
            disabled={!icon.trim()}
            onPress={() => void saveBase()}
          />
        </div>
      </section>

      {row ? (
        <CatalogTranslationsEditor
          translations={row.translations}
          requireDescription
          saving={loading}
          onSave={saveTranslation}
          onDelete={deleteTranslation}
        />
      ) : (
        <Text variant="small" color="tertiary">
          {t("translations.saveBaseFirst")}
        </Text>
      )}
    </FormShell>
  );
}

/** Create (no id) or edit (id) screen for a blog category. */
export function BlogCategoryFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("blogCommunity");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawBlogCategory(id ?? Number.NaN);

  if (isEdit && loading && !row) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {tc("common.loading")}
        </Text>
      </div>
    );
  }

  if (isEdit && !loading && !row) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {t("notFound")}
        </Text>
      </div>
    );
  }

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="WRITE_BLOG"
      fallback={<AccessDenied />}
    >
      <BlogCategoryForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
