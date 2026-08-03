"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import type { ProductCategoryMaterial, ProductCategoryMaterialUpsertRow } from "../types";

function MaterialCard({
  productCategoryId,
  existing,
  saving,
  onSave,
  onDelete,
}: {
  productCategoryId: number;
  existing: ProductCategoryMaterial | null;
  saving: boolean;
  onSave: (row: ProductCategoryMaterialUpsertRow) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}) {
  const { t } = useTranslation("marketplace");
  const [materialTypeId, setMaterialTypeId] = useState(
    existing ? String(existing.materialTypeId) : "",
  );
  const [quantity, setQuantity] = useState(existing ? String(existing.quantity) : "");
  const [unit, setUnit] = useState(existing?.unit ?? "percentage");
  const [isPrimary, setIsPrimary] = useState(existing?.isPrimary ?? false);

  const canSave = materialTypeId.trim() !== "" && quantity.trim() !== "";

  const save = () => {
    if (!canSave) return;
    void onSave({
      ...(existing ? { id: existing.id } : {}),
      productCategoryId,
      materialTypeId: Number(materialTypeId),
      quantity: Number(quantity),
      unit: unit.trim() || "percentage",
      isPrimary,
    });
  };

  const remove = () => {
    if (!existing) return;
    if (!window.confirm(t("materials.deleteConfirm"))) return;
    void onDelete(existing.id);
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
            disabled={saving}
            onClick={remove}
          />
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <Input
          name="materialTypeId"
          type="number"
          label={t("materials.materialTypeId")}
          value={materialTypeId}
          onChangeText={setMaterialTypeId}
        />
        <Input
          name="quantity"
          type="number"
          label={t("materials.quantity")}
          value={quantity}
          onChangeText={setQuantity}
        />
        <Input
          name="unit"
          label={t("materials.unit")}
          value={unit}
          onChangeText={setUnit}
        />
      </div>
      <div className="flex items-center justify-between">
        <Checkbox
          name="isPrimary"
          label={t("materials.isPrimary")}
          checked={isPrimary}
          onChange={setIsPrimary}
        />
        <MainButton
          text={existing ? t("materials.save") : t("materials.add")}
          leftIcon={existing ? undefined : Plus}
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
 * Material composition editor for a product category: edit/delete existing
 * material links + add new. Each save upserts one row via the table's bulk
 * mutation; `materialTypeId` points at a MaterialImpactEstimate.
 */
export function MaterialsEditor({
  productCategoryId,
  materials,
  saving,
  onSave,
  onDelete,
}: {
  productCategoryId: number;
  materials: ProductCategoryMaterial[];
  saving: boolean;
  onSave: (row: ProductCategoryMaterialUpsertRow) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}) {
  const { t } = useTranslation("marketplace");
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
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {materials.map((m) => (
          <MaterialCard
            key={`${m.id}-${m.materialTypeId}-${m.quantity}`}
            productCategoryId={productCategoryId}
            existing={m}
            saving={saving}
            onSave={onSave}
            onDelete={onDelete}
          />
        ))}
        <MaterialCard
          key="new"
          productCategoryId={productCategoryId}
          existing={null}
          saving={saving}
          onSave={onSave}
          onDelete={onDelete}
        />
      </div>
    </section>
  );
}
