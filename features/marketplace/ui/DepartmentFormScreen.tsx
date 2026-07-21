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
import { useCatalogMutations } from "../hooks/useCatalogMutations";
import { useRawDepartment } from "../hooks/useRawCatalog";
import { marketplacePaths } from "../paths";
import type { RawDepartment } from "../types";
import { TranslationsEditor, type TranslationSavePayload } from "./TranslationsEditor";

const toDateInput = (iso: string | null | undefined) => (iso ?? "").slice(0, 10);
const fromDateInput = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;

function DepartmentForm({
  lang,
  row,
  onSaved,
}: {
  lang: SupportedLanguage;
  row: RawDepartment | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("marketplace");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const {
    loading,
    upsertDepartments,
    upsertDepartmentTranslations,
    removeDepartment,
    removeDepartmentTranslation,
  } = useCatalogMutations();

  const [isActive, setIsActive] = useState(row?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(String(row?.sortOrder ?? 0));
  const [featuredFrom, setFeaturedFrom] = useState(toDateInput(row?.featuredFrom));
  const [featuredUntil, setFeaturedUntil] = useState(toDateInput(row?.featuredUntil));

  const saveBase = async () => {
    const result = await upsertDepartments([
      {
        ...(row ? { id: row.id } : {}),
        isActive,
        sortOrder: Number(sortOrder) || 0,
        featuredFrom: fromDateInput(featuredFrom),
        featuredUntil: fromDateInput(featuredUntil),
      },
    ]);
    if (!result || result.failed > 0) return;
    if (!row && result.createdIds[0] != null) {
      // Jump to the edit screen of the new row so translations can be added.
      navigateTo({
        route: marketplacePaths.departmentEdit(lang, result.createdIds[0]),
      });
      return;
    }
    onSaved();
  };

  const saveTranslation = async (payload: TranslationSavePayload) => {
    if (!row) return;
    const result = await upsertDepartmentTranslations([
      { ...payload, departmentId: row.id },
    ]);
    if (result && result.failed === 0) onSaved();
  };

  const deleteTranslation = async (id: number) => {
    if (await removeDepartmentTranslation(id)) onSaved();
  };

  const deleteRow = async () => {
    if (!row) return;
    if (!window.confirm(t("departments.deleteConfirm"))) return;
    if (await removeDepartment(row.id)) {
      navigateTo({ route: marketplacePaths.departments(lang) });
    }
  };

  return (
    <FormShell
      backHref={marketplacePaths.departments(lang)}
      backLabel={t("actions.backToList")}
      title={
        row
          ? t("departments.editTitle", { id: String(row.id) })
          : t("departments.newTitle")
      }
      subtitle={t("departments.formSubtitle")}
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
            onPress={() => void saveBase()}
          />
        </div>
      </section>

      {row ? (
        <TranslationsEditor
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

/** Create (no id) or edit (id) screen for a department. */
export function DepartmentFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("marketplace");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawDepartment(id ?? Number.NaN);

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
      <DepartmentForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
