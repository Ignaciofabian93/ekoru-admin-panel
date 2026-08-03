"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import Select from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { useStoreProductMutations } from "../hooks/useStoreProductMutations";
import type { ProductVariant } from "../types";

const SIZES = ["XS", "S", "M", "L", "XL"] as const;

function VariantCard({
  storeProductId,
  existing,
  onChanged,
}: {
  storeProductId: number;
  existing?: ProductVariant;
  onChanged: () => void;
}) {
  const { t } = useTranslation("storeProducts");
  const { upsertVariants, removeVariant, loading } = useStoreProductMutations();
  const [name, setName] = useState(existing?.name ?? "");
  const [price, setPrice] = useState(existing ? String(existing.price) : "");
  const [stock, setStock] = useState(existing ? String(existing.stock) : "");
  const [color, setColor] = useState(existing?.color ?? "");
  const [size, setSize] = useState(existing?.size ?? "M");

  const canSave =
    name.trim() !== "" && price.trim() !== "" && stock.trim() !== "" && size !== "";

  const save = async () => {
    if (!canSave) return;
    const result = await upsertVariants([
      {
        ...(existing ? { id: existing.id } : {}),
        storeProductId,
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        color: color.trim() === "" ? null : color.trim(),
        size,
      },
    ]);
    if (result && result.failed === 0) onChanged();
  };

  const remove = async () => {
    if (!existing) return;
    if (!window.confirm(t("variants.deleteConfirm"))) return;
    if (await removeVariant(existing.id)) onChanged();
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-light p-3">
      <div className="flex items-center justify-between">
        <Text variant="small" color="tertiary" weight="semibold">
          {existing ? `#${existing.id}` : t("variants.add")}
        </Text>
        {existing && (
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("variants.delete")}
            disabled={loading}
            onClick={remove}
          />
        )}
      </div>
      <Input name="name" label={t("variants.name")} value={name} onChangeText={setName} />
      <div className="grid grid-cols-2 gap-2">
        <Input
          name="price"
          type="number"
          label={t("variants.price")}
          value={price}
          onChangeText={setPrice}
        />
        <Input
          name="stock"
          type="number"
          label={t("variants.stock")}
          value={stock}
          onChangeText={setStock}
        />
        <Input
          name="color"
          label={t("variants.color")}
          value={color}
          onChangeText={setColor}
        />
        <Select
          name="size"
          label={t("variants.size")}
          options={SIZES.map((s) => ({ value: s, label: s }))}
          value={size}
          onChangeValue={setSize}
        />
      </div>
      <div className="flex justify-end">
        <MainButton
          text={existing ? t("variants.save") : t("variants.add")}
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

/** Variant rows for one store product: edit/delete + add. */
export function StoreProductVariantsEditor({
  storeProductId,
  variants,
  onChanged,
}: {
  storeProductId: number;
  variants: ProductVariant[];
  onChanged: () => void;
}) {
  const { t } = useTranslation("storeProducts");
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <Title level="h2" size="h6" weight="semibold">
        {t("variants.title")}
      </Title>
      {variants.length === 0 && (
        <Text variant="small" color="tertiary">
          {t("variants.empty")}
        </Text>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {variants.map((v) => (
          <VariantCard
            key={`${v.id}-${v.color ?? ""}-${v.size}`}
            storeProductId={storeProductId}
            existing={v}
            onChanged={onChanged}
          />
        ))}
        <VariantCard key="new" storeProductId={storeProductId} onChanged={onChanged} />
      </div>
    </section>
  );
}
