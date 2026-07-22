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
import { useServiceCatalogMutations } from "../hooks/useServiceCatalogMutations";
import {
  useRawServiceSubCategory,
  useServiceCategoryOptions,
} from "../hooks/useRawServiceCatalog";
import { catalogPaths } from "../paths";
import type { RawServiceSubCategory } from "../types";
import {
  CatalogTranslationsEditor,
  type CatalogTranslationSavePayload,
} from "./CatalogTranslationsEditor";

const toDateInput = (iso: string | null | undefined) => (iso ?? "").slice(0, 10);
const fromDateInput = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

function ServiceSubCategoryForm({
  lang,
  row,
  onSaved,
}: {
  lang: SupportedLanguage;
  row: RawServiceSubCategory | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("serviceCatalog");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { options: parentOptions, loading: optionsLoading } = useServiceCategoryOptions();
  const {
    loading,
    upsertServiceSubCategories,
    upsertServiceSubCategoryTranslations,
    removeServiceSubCategory,
    removeServiceSubCategoryTranslation,
  } = useServiceCatalogMutations();

  const [serviceCategoryId, setServiceCategoryId] = useState(
    row ? String(row.serviceCategoryId) : "",
  );
  const [isActive, setIsActive] = useState(row?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(row?.sortOrder ?? 0));
  const [featuredFrom, setFeaturedFrom] = useState(toDateInput(row?.featuredFrom));
  const [featuredUntil, setFeaturedUntil] = useState(toDateInput(row?.featuredUntil));

  const saveBase = async () => {
    if (!serviceCategoryId) return;
    const result = await upsertServiceSubCategories([
      {
        ...(row ? { id: row.id } : {}),
        // Sending serviceCategoryId on update re-parents the sub category —
        // the fix for rows related to the wrong service category.
        serviceCategoryId: Number(serviceCategoryId),
        isActive,
        sortOrder: Number(sortOrder) || 0,
        featuredFrom: fromDateInput(featuredFrom),
        featuredUntil: fromDateInput(featuredUntil),
      },
    ]);
    if (!result || result.failed > 0) return;
    if (!row && result.createdIds[0] != null) {
      navigateTo({
        route: catalogPaths.serviceSubCategoryEdit(lang, result.createdIds[0]),
      });
      return;
    }
    onSaved();
  };

  const saveTranslation = async (payload: CatalogTranslationSavePayload) => {
    if (!row) return;
    // The service sub category translation's name column is `subCategory`.
    const { name, ...rest } = payload;
    const result = await upsertServiceSubCategoryTranslations([
      { ...rest, subCategory: name, serviceSubCategoryId: row.id },
    ]);
    if (result && result.failed === 0) onSaved();
  };

  const deleteTranslation = async (id: number) => {
    if (await removeServiceSubCategoryTranslation(id)) onSaved();
  };

  const deleteRow = async () => {
    if (!row) return;
    if (!window.confirm(t("serviceSubCategories.deleteConfirm"))) return;
    if (await removeServiceSubCategory(row.id)) {
      navigateTo({ route: catalogPaths.serviceSubCategories(lang) });
    }
  };

  return (
    <FormShell
      backHref={catalogPaths.serviceSubCategories(lang)}
      backLabel={t("actions.backToList")}
      title={
        row
          ? t("serviceSubCategories.editTitle", { id: String(row.id) })
          : t("serviceSubCategories.newTitle")
      }
      subtitle={t("serviceSubCategories.formSubtitle")}
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
          label={t("fields.serviceCategory")}
          placeholder={optionsLoading ? tc("common.loading") : undefined}
          value={serviceCategoryId}
          options={parentOptions}
          onChangeValue={setServiceCategoryId}
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
            disabled={!serviceCategoryId}
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

/** Create (no id) or edit (id) screen for a service sub category. */
export function ServiceSubCategoryFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("serviceCatalog");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawServiceSubCategory(id ?? Number.NaN);

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
      <ServiceSubCategoryForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
