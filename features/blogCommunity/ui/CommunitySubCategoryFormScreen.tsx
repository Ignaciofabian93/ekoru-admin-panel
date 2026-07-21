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
import { Select } from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useBlogCommunityMutations } from "../hooks/useBlogCommunityMutations";
import {
  useCommunityCategoryOptions,
  useRawCommunitySubCategory,
} from "../hooks/useRawBlogCommunityCatalog";
import { catalogPaths } from "../paths";
import type { RawCommunitySubCategory } from "../types";
import {
  CatalogTranslationsEditor,
  type CatalogTranslationSavePayload,
} from "./CatalogTranslationsEditor";

const toDateInput = (iso: string | null | undefined) => (iso ?? "").slice(0, 10);
const fromDateInput = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

function CommunitySubCategoryForm({
  lang,
  row,
  onSaved,
}: {
  lang: SupportedLanguage;
  row: RawCommunitySubCategory | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("blogCommunity");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { options: parentOptions, loading: optionsLoading } =
    useCommunityCategoryOptions();
  const {
    loading,
    upsertCommunitySubCategories,
    upsertCommunitySubCategoryTranslations,
    removeCommunitySubCategory,
    removeCommunitySubCategoryTranslation,
  } = useBlogCommunityMutations();

  const [communityCategoryId, setCommunityCategoryId] = useState(
    row ? String(row.communityCategoryId) : "",
  );
  const [isActive, setIsActive] = useState(row?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(row?.sortOrder ?? 0));
  const [featuredFrom, setFeaturedFrom] = useState(toDateInput(row?.featuredFrom));
  const [featuredUntil, setFeaturedUntil] = useState(toDateInput(row?.featuredUntil));

  const saveBase = async () => {
    if (!communityCategoryId) return;
    const result = await upsertCommunitySubCategories([
      {
        ...(row ? { id: row.id } : {}),
        // Sending communityCategoryId on update re-parents the sub category —
        // the fix for rows related to the wrong community category.
        communityCategoryId: Number(communityCategoryId),
        isActive,
        sortOrder: Number(sortOrder) || 0,
        featuredFrom: fromDateInput(featuredFrom),
        featuredUntil: fromDateInput(featuredUntil),
      },
    ]);
    if (!result || result.failed > 0) return;
    if (!row && result.createdIds[0] != null) {
      navigateTo({
        route: catalogPaths.communitySubCategoryEdit(lang, result.createdIds[0]),
      });
      return;
    }
    onSaved();
  };

  const saveTranslation = async (payload: CatalogTranslationSavePayload) => {
    if (!row) return;
    // The community sub category translation's name column is `subCategory`.
    const { name, ...rest } = payload;
    const result = await upsertCommunitySubCategoryTranslations([
      { ...rest, subCategory: name, communitySubCategoryId: row.id },
    ]);
    if (result && result.failed === 0) onSaved();
  };

  const deleteTranslation = async (id: number) => {
    if (await removeCommunitySubCategoryTranslation(id)) onSaved();
  };

  const deleteRow = async () => {
    if (!row) return;
    if (!window.confirm(t("communitySubCategories.deleteConfirm"))) return;
    if (await removeCommunitySubCategory(row.id)) {
      navigateTo({ route: catalogPaths.communitySubCategories(lang) });
    }
  };

  return (
    <FormShell
      backHref={catalogPaths.communitySubCategories(lang)}
      backLabel={t("actions.backToList")}
      title={
        row
          ? t("communitySubCategories.editTitle", { id: String(row.id) })
          : t("communitySubCategories.newTitle")
      }
      subtitle={t("communitySubCategories.formSubtitle")}
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
        <Select
          label={t("fields.communityCategory")}
          placeholder={optionsLoading ? tc("common.loading") : undefined}
          value={communityCategoryId}
          options={parentOptions}
          onChangeValue={setCommunityCategoryId}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            name="sortOrder"
            type="number"
            label={t("fields.sortOrder")}
            value={sortOrder}
            onChangeText={setSortOrder}
          />
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
            disabled={!communityCategoryId}
            onPress={() => void saveBase()}
          />
        </div>
      </section>

      {row ? (
        <CatalogTranslationsEditor
          translations={row.translations}
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

/** Create (no id) or edit (id) screen for a community sub category. */
export function CommunitySubCategoryFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("blogCommunity");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawCommunitySubCategory(id ?? Number.NaN);

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
      permission="MODERATE_CONTENT"
      fallback={<AccessDenied />}
    >
      <CommunitySubCategoryForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
