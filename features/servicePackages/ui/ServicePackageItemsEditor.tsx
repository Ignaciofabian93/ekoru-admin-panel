"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { useServicePackageMutations } from "../hooks/useServicePackageMutations";
import type { ServicePackageItem } from "../types";

function ItemRow({
  packageId,
  existing,
  onChanged,
}: {
  packageId: number;
  existing?: ServicePackageItem;
  onChanged: () => void;
}) {
  const { t } = useTranslation("servicePackages");
  const { upsertItems, removeItem, loading } = useServicePackageMutations();
  const [serviceId, setServiceId] = useState(existing ? String(existing.serviceId) : "");
  const [quantity, setQuantity] = useState(existing ? String(existing.quantity) : "1");

  const canSave = serviceId.trim() !== "";

  const save = async () => {
    if (!canSave) return;
    const result = await upsertItems([
      {
        ...(existing ? { id: existing.id } : {}),
        packageId,
        serviceId: Number(serviceId),
        quantity: Number(quantity) || 1,
      },
    ]);
    if (result && result.failed === 0) onChanged();
  };

  const remove = async () => {
    if (!existing) return;
    if (!window.confirm(t("items.deleteConfirm"))) return;
    if (await removeItem(existing.id)) onChanged();
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-light p-3">
      <div className="flex items-center justify-between">
        <Text variant="small" color="tertiary" weight="semibold">
          {existing ? `#${existing.id}` : t("items.add")}
        </Text>
        {existing && (
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("items.delete")}
            disabled={loading}
            onClick={remove}
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          name="serviceId"
          type="number"
          label={t("items.serviceId")}
          value={serviceId}
          onChangeText={setServiceId}
        />
        <Input
          name="quantity"
          type="number"
          label={t("items.quantity")}
          value={quantity}
          onChangeText={setQuantity}
        />
      </div>
      <div className="flex justify-end">
        <MainButton
          text={existing ? t("items.save") : t("items.add")}
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

/** Items for one package: edit/delete existing + add new. */
export function ServicePackageItemsEditor({
  packageId,
  items,
  onChanged,
}: {
  packageId: number;
  items: ServicePackageItem[];
  onChanged: () => void;
}) {
  const { t } = useTranslation("servicePackages");
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <Title level="h2" size="h6" weight="semibold">
        {t("items.title")}
      </Title>
      {items.length === 0 && (
        <Text variant="small" color="tertiary">
          {t("items.empty")}
        </Text>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {items.map((i) => (
          <ItemRow key={i.id} packageId={packageId} existing={i} onChanged={onChanged} />
        ))}
        <ItemRow key="new" packageId={packageId} onChanged={onChanged} />
      </div>
    </section>
  );
}
