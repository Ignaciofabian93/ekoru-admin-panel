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
import { Textarea } from "@/components/Textarea/Textarea";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useProductMutations } from "../hooks/useProductMutations";
import { useProductCategoryOptions, useRawProduct } from "../hooks/useRawProducts";
import { productPaths } from "../paths";
import {
  PRODUCT_CONDITIONS,
  type Badge,
  type ProductCondition,
  type ProductUpsertRow,
  type RawProduct,
} from "../types";

const toDateInput = (iso: string | null | undefined) => (iso ?? "").slice(0, 10);
const fromDateInput = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;
const strOrNull = (v: string): string | null => (v.trim() === "" ? null : v.trim());
const splitList = (v: string): string[] =>
  v
    .split(/[|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

const card =
  "flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm";
const grid3 = "grid grid-cols-1 gap-3 md:grid-cols-3";

function ProductForm({
  lang,
  row,
  onSaved,
}: {
  lang: SupportedLanguage;
  row: RawProduct | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("products");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { options: categoryOptions, loading: optionsLoading } =
    useProductCategoryOptions();
  const { loading, upsertProducts, removeProduct } = useProductMutations();

  const [name, setName] = useState(row?.name ?? "");
  const [description, setDescription] = useState(row?.description ?? "");
  const [productCategoryId, setProductCategoryId] = useState(
    row ? String(row.productCategoryId) : "",
  );
  const [brand, setBrand] = useState(row?.brand ?? "");
  const [color, setColor] = useState(row?.color ?? "");
  const [sellerId, setSellerId] = useState(row?.sellerId ?? "");
  const [price, setPrice] = useState(row ? String(row.price) : "");
  const [condition, setCondition] = useState<string>(row?.condition ?? "NEW");
  const [conditionDescription, setConditionDescription] = useState(
    row?.conditionDescription ?? "",
  );
  const [isExchangeable, setIsExchangeable] = useState(row?.isExchangeable ?? false);
  const [interests, setInterests] = useState((row?.interests ?? []).join(" | "));
  const [badges, setBadges] = useState((row?.badges ?? []).join(" | "));
  const [isActive, setIsActive] = useState(row?.isActive ?? true);
  const [featuredFrom, setFeaturedFrom] = useState(toDateInput(row?.featuredFrom));
  const [featuredUntil, setFeaturedUntil] = useState(toDateInput(row?.featuredUntil));
  const [images, setImages] = useState((row?.images ?? []).join("\n"));

  const canSave =
    !!name.trim() &&
    !!description.trim() &&
    !!brand.trim() &&
    !!sellerId.trim() &&
    !!productCategoryId &&
    price.trim() !== "";

  const buildRow = (): ProductUpsertRow => ({
    ...(row ? { id: row.id } : {}),
    name: name.trim(),
    description: description.trim(),
    productCategoryId: Number(productCategoryId),
    brand: brand.trim(),
    color: strOrNull(color),
    sellerId: sellerId.trim(),
    price: Number(price) || 0,
    condition: condition as ProductCondition,
    conditionDescription: strOrNull(conditionDescription),
    isExchangeable,
    interests: splitList(interests),
    badges: splitList(badges).map((b) => b.toUpperCase()) as Badge[],
    isActive,
    featuredFrom: fromDateInput(featuredFrom),
    featuredUntil: fromDateInput(featuredUntil),
    images: splitList(images),
  });

  const save = async () => {
    if (!canSave) return;
    const result = await upsertProducts([buildRow()]);
    if (!result || result.failed > 0) return;
    if (!row && result.createdIds[0] != null) {
      navigateTo({ route: productPaths.edit(lang, result.createdIds[0]) });
      return;
    }
    onSaved();
  };

  const deleteRow = async () => {
    if (!row) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    if (await removeProduct(row.id)) {
      navigateTo({ route: productPaths.list(lang) });
    }
  };

  return (
    <FormShell
      backHref={productPaths.list(lang)}
      backLabel={t("actions.backToList")}
      title={row ? t("editTitle", { id: String(row.id) }) : t("newTitle")}
      subtitle={t("formSubtitle")}
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
      <section className={card}>
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.identity")}
        </Title>
        <Input name="name" label={t("fields.name")} value={name} onChangeText={setName} />
        <Textarea
          name="description"
          label={t("fields.description")}
          value={description}
          onChangeText={setDescription}
          rows={3}
        />
        <div className={grid3}>
          <Select
            label={t("fields.category")}
            placeholder={optionsLoading ? tc("common.loading") : undefined}
            value={productCategoryId}
            options={categoryOptions}
            onChangeValue={setProductCategoryId}
          />
          <Input
            name="brand"
            label={t("fields.brand")}
            value={brand}
            onChangeText={setBrand}
          />
          <Input
            name="color"
            label={t("fields.color")}
            value={color}
            onChangeText={setColor}
          />
        </div>
        <Input
          name="sellerId"
          label={t("fields.sellerId")}
          value={sellerId}
          onChangeText={setSellerId}
        />
      </section>

      <section className={card}>
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.commerce")}
        </Title>
        <div className={grid3}>
          <Input
            name="price"
            type="number"
            label={t("fields.price")}
            value={price}
            onChangeText={setPrice}
          />
        </div>
      </section>

      <section className={card}>
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.attributes")}
        </Title>
        <div className={grid3}>
          <Select
            label={t("fields.condition")}
            value={condition}
            options={PRODUCT_CONDITIONS.map((c) => ({
              value: c,
              label: t(`condition.${c}`),
            }))}
            onChangeValue={setCondition}
          />
        </div>
        <Input
          name="conditionDescription"
          label={t("fields.conditionDescription")}
          value={conditionDescription}
          onChangeText={setConditionDescription}
        />
        <Input
          name="interests"
          label={t("fields.interests")}
          placeholder={t("fields.listHint")}
          value={interests}
          onChangeText={setInterests}
        />
        <Input
          name="badges"
          label={t("fields.badges")}
          placeholder={t("fields.badgesHint")}
          value={badges}
          onChangeText={setBadges}
        />
        <Checkbox
          name="isExchangeable"
          label={t("fields.isExchangeable")}
          checked={isExchangeable}
          onChange={setIsExchangeable}
        />
      </section>

      <section className={card}>
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.status")}
        </Title>
        <div className={grid3}>
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
      </section>

      <section className={card}>
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.media")}
        </Title>
        <Textarea
          name="images"
          label={t("fields.images")}
          placeholder={t("fields.listHint")}
          value={images}
          onChangeText={setImages}
          rows={3}
        />
      </section>

      {row && (
        <section className={card}>
          <Title level="h2" size="h6" weight="semibold">
            {t("sections.metrics")}
          </Title>
          <Text variant="small" color="tertiary">
            {`${t("fields.likesCount")}: ${row.likesCount} · ${t("fields.viewCount")}: ${row.viewCount}`}
          </Text>
        </section>
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

/** Create (no id) or edit (id) screen for a marketplace product. */
export function ProductFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("products");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawProduct(id ?? Number.NaN);

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
      <ProductForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
