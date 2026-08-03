"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { useStoreProductMutations } from "../hooks/useStoreProductMutations";
import type { StoreProductMaterial } from "../types";

function MaterialCard({
  storeProductId,
  existing,
  onChanged,
}: {
  storeProductId: number;
  existing?: StoreProductMaterial;
  onChanged: () => void;
}) {
  const { t } = useTranslation("storeProducts");
  const { upsertMaterials, removeMaterial, loading } = useStoreProductMutations();
  const [materialTypeId, setMaterialTypeId] = useState(
    existing ? String(existing.materialTypeId) : "",
  );
  const [percentage, setPercentage] = useState(
    existing ? String(existing.percentage) : "",
  );

  const canSave = materialTypeId.trim() !== "" && percentage.trim() !== "";

  const save = async () => {
    if (!canSave) return;
    const result = await upsertMaterials([
      {
        ...(existing ? { id: existing.id } : {}),
        storeProductId,
        materialTypeId: Number(materialTypeId),
        percentage: Number(percentage),
      },
    ]);
    if (result && result.failed === 0) onChanged();
  };

  const remove = async () => {
    if (!existing) return;
    if (!window.confirm(t("materials.deleteConfirm"))) return;
    if (await removeMaterial(existing.id)) onChanged();
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-light p-3">
      <div className="flex items-center justify-between">
        <Text variant="small" color="tertiary" weight="semibold">
          {existing
            ? `${existing.materialType ?? t("materials.material")} · #${existing.id}`
            : t("materials.add")}
        </Text>
        {existing && (
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("materials.delete")}
            disabled={loading}
            onClick={remove}
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          name="materialTypeId"
          type="number"
          label={t("materials.materialTypeId")}
          value={materialTypeId}
          onChangeText={setMaterialTypeId}
        />
        <Input
          name="percentage"
          type="number"
          label={t("materials.percentage")}
          value={percentage}
          onChangeText={setPercentage}
        />
      </div>
      <div className="flex justify-end">
        <MainButton
          text={existing ? t("materials.save") : t("materials.add")}
          leftIcon={existing ? undefined : Plus}
          size="sm"
          loading={loading}
          disabled={!canSave}
          onPress={save}
        />
      </div>
    </div>
  );
}

/** Material composition rows for one store product: edit/delete + add. */
export function StoreProductMaterialsEditor({
  storeProductId,
  materials,
  onChanged,
}: {
  storeProductId: number;
  materials: StoreProductMaterial[];
  onChanged: () => void;
}) {
  const { t } = useTranslation("storeProducts");
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <Title level="h2" size="h6" weight="semibold">
        {t("materials.title")}
      </Title>
      {materials.length === 0 && (
        <Text variant="small" color="tertiary">
          {t("materials.empty")}
        </Text>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {materials.map((m) => (
          <MaterialCard
            key={`${m.id}-${m.materialTypeId}-${m.percentage}`}
            storeProductId={storeProductId}
            existing={m}
            onChanged={onChanged}
          />
        ))}
        <MaterialCard key="new" storeProductId={storeProductId} onChanged={onChanged} />
      </div>
    </section>
  );
}
