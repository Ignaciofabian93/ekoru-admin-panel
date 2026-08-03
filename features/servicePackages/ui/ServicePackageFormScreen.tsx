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
import Textarea from "@/components/Textarea/Textarea";
import { Text } from "@/components/Text/Text";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useRawServicePackage } from "../hooks/useRawServicePackages";
import { useServicePackageMutations } from "../hooks/useServicePackageMutations";
import { servicePackagePaths } from "../paths";
import type { RawServicePackage, ServicePackageUpsertRow } from "../types";
import { ServicePackageItemsEditor } from "./ServicePackageItemsEditor";

const card =
  "flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm";

const numOrNull = (v: string): number | null => (v.trim() === "" ? null : Number(v));

function PackageForm({
  lang,
  pkg,
  onSaved,
}: {
  lang: SupportedLanguage;
  pkg: RawServicePackage | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("servicePackages");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { loading, upsertPackages, removePackage } = useServicePackageMutations();

  const [sellerId, setSellerId] = useState(pkg?.sellerId ?? "");
  const [name, setName] = useState(pkg?.name ?? "");
  const [description, setDescription] = useState(pkg?.description ?? "");
  const [totalPrice, setTotalPrice] = useState(
    pkg?.totalPrice != null ? String(pkg.totalPrice) : "",
  );
  const [discountPercentage, setDiscountPercentage] = useState(
    pkg?.discountPercentage != null ? String(pkg.discountPercentage) : "",
  );
  const [validityDays, setValidityDays] = useState(
    pkg?.validityDays != null ? String(pkg.validityDays) : "",
  );
  const [isActive, setIsActive] = useState(pkg?.isActive ?? true);

  const canSave =
    sellerId.trim() !== "" &&
    name.trim() !== "" &&
    description.trim() !== "" &&
    totalPrice.trim() !== "";

  const buildRow = (): ServicePackageUpsertRow => ({
    ...(pkg ? { id: pkg.id } : {}),
    sellerId: sellerId.trim(),
    name: name.trim(),
    description: description.trim(),
    totalPrice: Number(totalPrice),
    discountPercentage: numOrNull(discountPercentage),
    validityDays: numOrNull(validityDays),
    isActive,
  });

  const save = async () => {
    if (!canSave) return;
    const result = await upsertPackages([buildRow()]);
    if (!result || result.failed > 0) return;
    if (!pkg && result.createdIds[0] != null) {
      navigateTo({ route: servicePackagePaths.edit(lang, result.createdIds[0]) });
      return;
    }
    onSaved();
  };

  const deleteRow = async () => {
    if (!pkg) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    if (await removePackage(pkg.id))
      navigateTo({ route: servicePackagePaths.list(lang) });
  };

  return (
    <FormShell
      backHref={servicePackagePaths.list(lang)}
      backLabel={t("actions.backToList")}
      title={pkg ? t("editTitle", { id: String(pkg.id) }) : t("newTitle")}
      subtitle={t("formSubtitle")}
      actions={
        pkg ? (
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
      <section className={card}>
        <Text variant="span" weight="semibold" color="tertiary">
          {t("baseSection")}
        </Text>
        <Input name="name" label={t("fields.name")} value={name} onChangeText={setName} />
        <Textarea
          name="description"
          label={t("fields.description")}
          rows={3}
          value={description}
          onChangeText={setDescription}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            name="sellerId"
            label={t("fields.sellerId")}
            value={sellerId}
            onChangeText={setSellerId}
          />
          <Input
            name="totalPrice"
            type="number"
            label={t("fields.totalPrice")}
            value={totalPrice}
            onChangeText={setTotalPrice}
          />
          <Input
            name="discountPercentage"
            type="number"
            label={t("fields.discountPercentage")}
            value={discountPercentage}
            onChangeText={setDiscountPercentage}
          />
          <Input
            name="validityDays"
            type="number"
            label={t("fields.validityDays")}
            value={validityDays}
            onChangeText={setValidityDays}
          />
        </div>
        <Checkbox
          name="isActive"
          label={t("fields.isActive")}
          checked={isActive}
          onChange={setIsActive}
        />
      </section>

      {pkg ? (
        <ServicePackageItemsEditor
          packageId={pkg.id}
          items={pkg.servicePackageItem}
          onChanged={onSaved}
        />
      ) : (
        <Text variant="small" color="tertiary">
          {t("items.saveHintNew")}
        </Text>
      )}

      <div className="flex justify-end">
        <MainButton
          text={tc("common.save")}
          loading={loading}
          disabled={!canSave}
          onPress={() => void save()}
        />
      </div>
    </FormShell>
  );
}

/** Create (no id) or edit (id) screen for a service package. */
export function ServicePackageFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("servicePackages");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawServicePackage(id ?? Number.NaN);

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
      permission="MANAGE_PRODUCTS"
      fallback={<AccessDenied />}
    >
      <PackageForm
        key={row ? `${row.id}-${row.updatedAt}-${row.servicePackageItem.length}` : "new"}
        lang={lang}
        pkg={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
