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
import { useCatalogMutations } from "../hooks/useCatalogMutations";
import {
  useDepartmentCategoryOptions,
  useRawProductCategory,
} from "../hooks/useRawCatalog";
import { marketplacePaths } from "../paths";
import {
  PRODUCT_SIZES,
  WEIGHT_UNITS,
  type ProductSize,
  type RawProductCategory,
  type WeightUnit,
} from "../types";
import { TranslationsEditor, type TranslationSavePayload } from "./TranslationsEditor";
import { MaterialsEditor } from "./MaterialsEditor";
import type { ProductCategoryMaterialUpsertRow } from "../types";

const toDateInput = (iso: string | null | undefined) => (iso ?? "").slice(0, 10);
const fromDateInput = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

function ProductCategoryForm({
  lang,
  row,
  onSaved,
}: {
  lang: SupportedLanguage;
  row: RawProductCategory | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("marketplace");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { options: parentOptions, loading: optionsLoading } =
    useDepartmentCategoryOptions();
  const {
    loading,
    upsertProductCategories,
    upsertProductCategoryTranslations,
    upsertProductCategoryMaterials,
    removeProductCategory,
    removeProductCategoryTranslation,
    removeProductCategoryMaterial,
  } = useCatalogMutations();

  const [departmentCategoryId, setDepartmentCategoryId] = useState(
    row ? String(row.departmentCategoryId) : "",
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
    if (!departmentCategoryId) return;
    const result = await upsertProductCategories([
      {
        ...(row ? { id: row.id } : {}),
        // Sending departmentCategoryId on update re-parents the product
        // category — the fix for rows related to the wrong department category.
        departmentCategoryId: Number(departmentCategoryId),
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
        route: marketplacePaths.productCategoryEdit(lang, result.createdIds[0]),
      });
      return;
    }
    onSaved();
  };

  const saveTranslation = async (payload: TranslationSavePayload) => {
    if (!row) return;
    const result = await upsertProductCategoryTranslations([
      { ...payload, productCategoryId: row.id },
    ]);
    if (result && result.failed === 0) onSaved();
  };

  const deleteTranslation = async (id: number) => {
    if (await removeProductCategoryTranslation(id)) onSaved();
  };

  const saveMaterial = async (materialRow: ProductCategoryMaterialUpsertRow) => {
    if (!row) return;
    const result = await upsertProductCategoryMaterials([materialRow]);
    if (result && result.failed === 0) onSaved();
  };

  const deleteMaterial = async (id: number) => {
    if (await removeProductCategoryMaterial(id)) onSaved();
  };

  const deleteRow = async () => {
    if (!row) return;
    if (!window.confirm(t("productCategories.deleteConfirm"))) return;
    if (await removeProductCategory(row.id)) {
      navigateTo({ route: marketplacePaths.productCategories(lang) });
    }
  };

  const emptyOption = { value: "", label: "—" };

  return (
    <FormShell
      backHref={marketplacePaths.productCategories(lang)}
      backLabel={t("actions.backToList")}
      title={
        row
          ? t("productCategories.editTitle", { id: String(row.id) })
          : t("productCategories.newTitle")
      }
      subtitle={t("productCategories.formSubtitle")}
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
          label={t("fields.departmentCategory")}
          placeholder={optionsLoading ? tc("common.loading") : undefined}
          value={departmentCategoryId}
          options={parentOptions}
          onChangeValue={setDepartmentCategoryId}
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
            disabled={!departmentCategoryId}
            onPress={() => void saveBase()}
          />
        </div>
      </section>

      {row ? (
        <>
          <TranslationsEditor
            translations={row.translations}
            showKeywords
            saving={loading}
            onSave={saveTranslation}
            onDelete={deleteTranslation}
          />
          <MaterialsEditor
            productCategoryId={row.id}
            materials={row.materials}
            saving={loading}
            onSave={saveMaterial}
            onDelete={deleteMaterial}
          />
        </>
      ) : (
        <Text variant="small" color="tertiary">
          {t("translations.saveBaseFirst")}
        </Text>
      )}
    </FormShell>
  );
}

/** Create (no id) or edit (id) screen for a product category. */
export function ProductCategoryFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("marketplace");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawProductCategory(id ?? Number.NaN);

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
      <ProductCategoryForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
