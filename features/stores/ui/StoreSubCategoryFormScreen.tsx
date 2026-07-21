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
import { useStoreCatalogMutations } from "../hooks/useStoreCatalogMutations";
import {
  useRawStoreSubCategory,
  useStoreCategoryOptions,
} from "../hooks/useRawStoreCatalog";
import { storePaths } from "../paths";
import {
  PRODUCT_SIZES,
  WEIGHT_UNITS,
  type ProductSize,
  type RawStoreSubCategory,
  type WeightUnit,
} from "../types";
import { TranslationsEditor, type TranslationSavePayload } from "./TranslationsEditor";

const toDateInput = (iso: string | null | undefined) => (iso ?? "").slice(0, 10);
const fromDateInput = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

function StoreSubCategoryForm({
  lang,
  row,
  onSaved,
}: {
  lang: SupportedLanguage;
  row: RawStoreSubCategory | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("stores");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { options: parentOptions, loading: optionsLoading } = useStoreCategoryOptions();
  const {
    loading,
    upsertStoreSubCategories,
    upsertStoreSubCategoryTranslations,
    removeStoreSubCategory,
    removeStoreSubCategoryTranslation,
  } = useStoreCatalogMutations();

  const [storeCategoryId, setStoreCategoryId] = useState(
    row ? String(row.storeCategoryId) : "",
  );
  const [averageWeight, setAverageWeight] = useState(
    row?.averageWeight != null ? String(row.averageWeight) : "",
  );
  const [size, setSize] = useState<string>(row?.size ?? "");
  const [weightUnit, setWeightUnit] = useState<string>(row?.weightUnit ?? "");
  const [isActive, setIsActive] = useState(row?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(row?.sortOrder ?? 0));
  const [featuredFrom, setFeaturedFrom] = useState(toDateInput(row?.featuredFrom));
  const [featuredUntil, setFeaturedUntil] = useState(toDateInput(row?.featuredUntil));

  const saveBase = async () => {
    if (!storeCategoryId) return;
    const result = await upsertStoreSubCategories([
      {
        ...(row ? { id: row.id } : {}),
        // Sending storeCategoryId on update re-parents the sub category — the
        // fix for rows related to the wrong store category.
        storeCategoryId: Number(storeCategoryId),
        averageWeight: averageWeight === "" ? null : Number(averageWeight),
        size: size === "" ? null : (size as ProductSize),
        weightUnit: weightUnit === "" ? null : (weightUnit as WeightUnit),
        isActive,
        sortOrder: Number(sortOrder) || 0,
        featuredFrom: fromDateInput(featuredFrom),
        featuredUntil: fromDateInput(featuredUntil),
      },
    ]);
    if (!result || result.failed > 0) return;
    if (!row && result.createdIds[0] != null) {
      navigateTo({
        route: storePaths.storeSubCategoryEdit(lang, result.createdIds[0]),
      });
      return;
    }
    onSaved();
  };

  const saveTranslation = async (payload: TranslationSavePayload) => {
    if (!row) return;
    const result = await upsertStoreSubCategoryTranslations([
      { ...payload, storeSubCategoryId: row.id },
    ]);
    if (result && result.failed === 0) onSaved();
  };

  const deleteTranslation = async (id: number) => {
    if (await removeStoreSubCategoryTranslation(id)) onSaved();
  };

  const deleteRow = async () => {
    if (!row) return;
    if (!window.confirm(t("storeSubCategories.deleteConfirm"))) return;
    if (await removeStoreSubCategory(row.id)) {
      navigateTo({ route: storePaths.storeSubCategories(lang) });
    }
  };

  const emptyOption = { value: "", label: "—" };

  return (
    <FormShell
      backHref={storePaths.storeSubCategories(lang)}
      backLabel={t("actions.backToList")}
      title={
        row
          ? t("storeSubCategories.editTitle", { id: String(row.id) })
          : t("storeSubCategories.newTitle")
      }
      subtitle={t("storeSubCategories.formSubtitle")}
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
          label={t("fields.storeCategory")}
          placeholder={optionsLoading ? tc("common.loading") : undefined}
          value={storeCategoryId}
          options={parentOptions}
          onChangeValue={setStoreCategoryId}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            name="averageWeight"
            type="number"
            label={t("fields.averageWeight")}
            value={averageWeight}
            onChangeText={setAverageWeight}
          />
          <Select
            label={t("fields.size")}
            value={size}
            options={[emptyOption, ...PRODUCT_SIZES.map((s) => ({ value: s, label: s }))]}
            onChangeValue={setSize}
          />
          <Select
            label={t("fields.weightUnit")}
            value={weightUnit}
            options={[emptyOption, ...WEIGHT_UNITS.map((u) => ({ value: u, label: u }))]}
            onChangeValue={setWeightUnit}
          />
        </div>
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
            disabled={!storeCategoryId}
            onPress={() => void saveBase()}
          />
        </div>
      </section>

      {row ? (
        <TranslationsEditor
          translations={row.translations}
          showKeywords
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

/** Create (no id) or edit (id) screen for a store sub category. */
export function StoreSubCategoryFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("stores");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawStoreSubCategory(id ?? Number.NaN);

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
      permission="MANAGE_CATEGORIES"
      fallback={<AccessDenied />}
    >
      <StoreSubCategoryForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
