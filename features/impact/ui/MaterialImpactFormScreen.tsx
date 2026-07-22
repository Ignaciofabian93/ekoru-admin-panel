"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { FormShell } from "@/components/FormShell/FormShell";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useImpactMutations } from "../hooks/useImpactMutations";
import { useRawMaterialImpact } from "../hooks/useImpact";
import { impactPaths } from "../paths";
import {
  CATALOG_LANGUAGES,
  type CatalogLanguage,
  type MaterialImpactTranslation,
  type RawMaterialImpact,
} from "../types";

function TranslationCard({
  code,
  existing,
  saving,
  onSave,
  onDelete,
}: {
  code: CatalogLanguage;
  existing: MaterialImpactTranslation | null;
  saving: boolean;
  onSave: (code: CatalogLanguage, value: string) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}) {
  const { t } = useTranslation("impact");
  const [value, setValue] = useState(existing?.materialTypeTranslation ?? "");

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
            onClick={() => {
              if (window.confirm(t("translations.deleteConfirm")))
                void onDelete(existing.id);
            }}
          />
        )}
      </div>
      <Input
        name={`tr-${code}`}
        label={t("fields.materialTypeTranslation")}
        value={value}
        onChangeText={setValue}
      />
      <div className="flex justify-end">
        <MainButton
          text={t("translations.save")}
          size="sm"
          loading={saving}
          disabled={!value.trim()}
          onPress={() => void onSave(code, value.trim())}
        />
      </div>
    </div>
  );
}

function MaterialImpactForm({
  lang,
  row,
  onSaved,
}: {
  lang: SupportedLanguage;
  row: RawMaterialImpact | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("impact");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const {
    loading,
    upsertMaterialImpacts,
    upsertMaterialImpactTranslations,
    removeMaterialImpact,
    removeMaterialImpactTranslation,
  } = useImpactMutations();

  const [materialType, setMaterialType] = useState(row?.materialType ?? "");
  const [co2, setCo2] = useState(row ? String(row.estimatedCo2SavingsKG) : "0");
  const [water, setWater] = useState(row ? String(row.estimatedWaterSavingsLT) : "0");

  const saveBase = async () => {
    if (!materialType.trim()) return;
    const result = await upsertMaterialImpacts([
      {
        ...(row ? { id: row.id } : {}),
        materialType: materialType.trim(),
        estimatedCo2SavingsKG: Number(co2) || 0,
        estimatedWaterSavingsLT: Number(water) || 0,
      },
    ]);
    if (!result || result.failed > 0) return;
    if (!row && result.createdIds[0] != null) {
      navigateTo({
        route: impactPaths.materialImpactEdit(lang, result.createdIds[0]),
      });
      return;
    }
    onSaved();
  };

  const saveTranslation = async (code: CatalogLanguage, value: string) => {
    if (!row) return;
    const result = await upsertMaterialImpactTranslations([
      {
        materialImpactEstimateId: row.id,
        language: code,
        materialTypeTranslation: value,
      },
    ]);
    if (result && result.failed === 0) onSaved();
  };

  const deleteTranslation = async (id: number) => {
    if (await removeMaterialImpactTranslation(id)) onSaved();
  };

  const deleteRow = async () => {
    if (!row) return;
    if (!window.confirm(t("material.deleteConfirm"))) return;
    if (await removeMaterialImpact(row.id)) {
      navigateTo({ route: impactPaths.materialImpacts(lang) });
    }
  };

  return (
    <FormShell
      backHref={impactPaths.materialImpacts(lang)}
      backLabel={t("actions.backToList")}
      title={
        row ? t("material.editTitle", { id: String(row.id) }) : t("material.newTitle")
      }
      subtitle={t("material.formSubtitle")}
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
        <Input
          name="materialType"
          label={t("fields.materialType")}
          value={materialType}
          onChangeText={setMaterialType}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            name="co2"
            type="number"
            label={t("fields.estimatedCo2SavingsKG")}
            value={co2}
            onChangeText={setCo2}
          />
          <Input
            name="water"
            type="number"
            label={t("fields.estimatedWaterSavingsLT")}
            value={water}
            onChangeText={setWater}
          />
        </div>
        <div className="flex justify-end">
          <MainButton
            text={tc("common.save")}
            size="sm"
            loading={loading}
            disabled={!materialType.trim()}
            onPress={() => void saveBase()}
          />
        </div>
      </section>

      {row ? (
        <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
          <Title level="h2" size="h6" weight="semibold">
            {t("translations.title")}
          </Title>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {CATALOG_LANGUAGES.map((code) => {
              const existing =
                row.translations.find((tr) => tr.language === code) ?? null;
              return (
                <TranslationCard
                  key={`${code}-${existing?.id ?? "new"}-${existing?.materialTypeTranslation ?? ""}`}
                  code={code}
                  existing={existing}
                  saving={loading}
                  onSave={saveTranslation}
                  onDelete={deleteTranslation}
                />
              );
            })}
          </div>
        </section>
      ) : (
        <Text variant="small" color="tertiary">
          {t("translations.saveBaseFirst")}
        </Text>
      )}
    </FormShell>
  );
}

/** Create (no id) or edit (id) screen for a material impact estimate. */
export function MaterialImpactFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("impact");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawMaterialImpact(id ?? Number.NaN);

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
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      <MaterialImpactForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
