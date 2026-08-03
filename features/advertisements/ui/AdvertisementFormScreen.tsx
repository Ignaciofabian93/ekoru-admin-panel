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
import Select from "@/components/Select/Select";
import Textarea from "@/components/Textarea/Textarea";
import { Text } from "@/components/Text/Text";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useRawAdvertisement } from "../hooks/useRawAdvertisements";
import { useAdvertisementMutations } from "../hooks/useAdvertisementMutations";
import { advertisementPaths } from "../paths";
import {
  ADVERTISEMENT_TYPES,
  type AdvertisementType,
  type AdvertisementUpsertRow,
  type RawAdvertisement,
} from "../types";

const card =
  "flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm";

const initDate = (iso: string | null | undefined): string =>
  iso ? iso.slice(0, 10) : "";
const numOrNull = (v: string): number | null => (v.trim() === "" ? null : Number(v));

function AdForm({
  lang,
  ad,
  onSaved,
}: {
  lang: SupportedLanguage;
  ad: RawAdvertisement | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("advertisements");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { loading, upsert, remove } = useAdvertisementMutations();

  const [adType, setAdType] = useState<AdvertisementType>(ad?.adType ?? "HERO_BANNER");
  const [price, setPrice] = useState(ad?.price != null ? String(ad.price) : "");
  const [content, setContent] = useState(ad?.content ?? "");
  const [startDate, setStartDate] = useState(initDate(ad?.startDate));
  const [endDate, setEndDate] = useState(initDate(ad?.endDate));
  const [isActive, setIsActive] = useState(ad?.isActive ?? true);
  const [sellerId, setSellerId] = useState(ad?.sellerId ?? "");
  const [productId, setProductId] = useState(
    ad?.productId != null ? String(ad.productId) : "",
  );
  const [storeProductId, setStoreProductId] = useState(
    ad?.storeProductId != null ? String(ad.storeProductId) : "",
  );
  const [serviceId, setServiceId] = useState(
    ad?.serviceId != null ? String(ad.serviceId) : "",
  );

  const canSave =
    price.trim() !== "" &&
    content.trim() !== "" &&
    startDate !== "" &&
    endDate !== "" &&
    sellerId.trim() !== "";

  const buildRow = (): AdvertisementUpsertRow => ({
    ...(ad ? { id: ad.id } : {}),
    adType,
    price: Number(price),
    content: content.trim(),
    startDate,
    endDate,
    isActive,
    sellerId: sellerId.trim(),
    productId: numOrNull(productId),
    storeProductId: numOrNull(storeProductId),
    serviceId: numOrNull(serviceId),
  });

  const save = async () => {
    if (!canSave) return;
    const result = await upsert([buildRow()]);
    if (!result || result.failed > 0) return;
    if (!ad && result.createdIds[0] != null) {
      navigateTo({ route: advertisementPaths.edit(lang, result.createdIds[0]) });
      return;
    }
    onSaved();
  };

  const deleteRow = async () => {
    if (!ad) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    if (await remove(ad.id)) navigateTo({ route: advertisementPaths.list(lang) });
  };

  return (
    <FormShell
      backHref={advertisementPaths.list(lang)}
      backLabel={t("actions.backToList")}
      title={ad ? t("editTitle", { id: String(ad.id) }) : t("newTitle")}
      subtitle={t("formSubtitle")}
      actions={
        ad ? (
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Select
            name="adType"
            label={t("fields.adType")}
            options={ADVERTISEMENT_TYPES.map((o) => ({ value: o, label: o }))}
            value={adType}
            onChangeValue={(v) => setAdType(v as AdvertisementType)}
          />
          <Input
            name="price"
            type="number"
            label={t("fields.price")}
            value={price}
            onChangeText={setPrice}
          />
          <Input
            name="startDate"
            type="date"
            label={t("fields.startDate")}
            value={startDate}
            onChangeText={setStartDate}
          />
          <Input
            name="endDate"
            type="date"
            label={t("fields.endDate")}
            value={endDate}
            onChangeText={setEndDate}
          />
          <Input
            name="sellerId"
            label={t("fields.sellerId")}
            value={sellerId}
            onChangeText={setSellerId}
          />
        </div>
        <Textarea
          name="content"
          label={t("fields.content")}
          rows={3}
          value={content}
          onChangeText={setContent}
        />
        <Checkbox
          name="isActive"
          label={t("fields.isActive")}
          checked={isActive}
          onChange={setIsActive}
        />
      </section>

      <section className={card}>
        <Text variant="span" weight="semibold" color="tertiary">
          {t("targetSection")}
        </Text>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Input
            name="productId"
            type="number"
            label={t("fields.productId")}
            value={productId}
            onChangeText={setProductId}
          />
          <Input
            name="storeProductId"
            type="number"
            label={t("fields.storeProductId")}
            value={storeProductId}
            onChangeText={setStoreProductId}
          />
          <Input
            name="serviceId"
            type="number"
            label={t("fields.serviceId")}
            value={serviceId}
            onChangeText={setServiceId}
          />
        </div>
      </section>

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

/** Create (no id) or edit (id) screen for an advertisement. */
export function AdvertisementFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("advertisements");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawAdvertisement(id ?? Number.NaN);

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
      <AdForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        ad={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
