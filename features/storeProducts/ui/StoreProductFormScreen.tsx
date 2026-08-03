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
import { useStoreProductMutations } from "../hooks/useStoreProductMutations";
import {
  useRawStoreProduct,
  useStoreSubCategoryOptions,
} from "../hooks/useRawStoreProducts";
import { storeProductPaths } from "../paths";
import {
  DIMENSION_UNITS,
  WEIGHT_UNITS,
  type Badge,
  type DimensionUnit,
  type RawStoreProduct,
  type StoreProductUpsertRow,
  type WeightUnit,
} from "../types";
import { StoreProductMaterialsEditor } from "./StoreProductMaterialsEditor";
import { StoreProductVariantsEditor } from "./StoreProductVariantsEditor";

const toDateInput = (iso: string | null | undefined) => (iso ?? "").slice(0, 10);
const fromDateInput = (value: string): string | null =>
  value ? new Date(value).toISOString() : null;
const numOrNull = (v: string): number | null => (v.trim() === "" ? null : Number(v));
const strOrNull = (v: string): string | null => (v.trim() === "" ? null : v.trim());
const splitList = (v: string): string[] =>
  v
    .split(/[|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

const card =
  "flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm";
const grid3 = "grid grid-cols-1 gap-3 md:grid-cols-3";

function StoreProductForm({
  lang,
  row,
  onSaved,
}: {
  lang: SupportedLanguage;
  row: RawStoreProduct | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("storeProducts");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { options: subCategoryOptions, loading: optionsLoading } =
    useStoreSubCategoryOptions();
  const { loading, upsertStoreProducts, removeStoreProduct } = useStoreProductMutations();

  // Identity
  const [name, setName] = useState(row?.name ?? "");
  const [description, setDescription] = useState(row?.description ?? "");
  const [sellerId, setSellerId] = useState(row?.sellerId ?? "");
  const [subCategoryId, setSubCategoryId] = useState(
    row ? String(row.subCategoryId) : "",
  );
  const [brand, setBrand] = useState(row?.brand ?? "");
  const [color, setColor] = useState(row?.color ?? "");
  // Commerce
  const [price, setPrice] = useState(row ? String(row.price) : "");
  const [stock, setStock] = useState(row ? String(row.stock) : "0");
  const [hasOffer, setHasOffer] = useState(row?.hasOffer ?? false);
  const [offerPrice, setOfferPrice] = useState(
    row?.offerPrice != null ? String(row.offerPrice) : "",
  );
  const [sku, setSku] = useState(row?.sku ?? "");
  const [barcode, setBarcode] = useState(row?.barcode ?? "");
  // Status
  const [isActive, setIsActive] = useState(row?.isActive ?? true);
  const [badges, setBadges] = useState((row?.badges ?? []).join(" | "));
  const [featuredFrom, setFeaturedFrom] = useState(toDateInput(row?.featuredFrom));
  const [featuredUntil, setFeaturedUntil] = useState(toDateInput(row?.featuredUntil));
  // Media
  const [images, setImages] = useState((row?.images ?? []).join("\n"));
  // Specs
  const [materialComposition, setMaterialComposition] = useState(
    row?.materialComposition ?? "",
  );
  const [recycledContent, setRecycledContent] = useState(
    row?.recycledContent != null ? String(row.recycledContent) : "",
  );
  const [weight, setWeight] = useState(row?.weight != null ? String(row.weight) : "");
  const [weightUnit, setWeightUnit] = useState<string>(row?.weightUnit ?? "");
  const [length, setLength] = useState(row?.length != null ? String(row.length) : "");
  const [width, setWidth] = useState(row?.width != null ? String(row.width) : "");
  const [height, setHeight] = useState(row?.height != null ? String(row.height) : "");
  const [dimensionUnit, setDimensionUnit] = useState<string>(row?.dimensionUnit ?? "");
  const [lowStockThreshold, setLowStockThreshold] = useState(
    row?.lowStockThreshold != null ? String(row.lowStockThreshold) : "",
  );
  const [isLowStock, setIsLowStock] = useState(row?.isLowStock ?? false);
  // SEO
  const [tags, setTags] = useState((row?.tags ?? []).join(" | "));
  const [metaTitle, setMetaTitle] = useState(row?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(row?.metaDescription ?? "");
  // Additional
  const [warranty, setWarranty] = useState(row?.warranty ?? false);
  const [warrantyDuration, setWarrantyDuration] = useState(
    row?.warrantyDuration != null ? String(row.warrantyDuration) : "",
  );
  const [features, setFeatures] = useState((row?.features ?? []).join("\n"));

  const canSave =
    !!name.trim() &&
    !!description.trim() &&
    !!sellerId.trim() &&
    !!subCategoryId &&
    price.trim() !== "";

  const emptyUnit = { value: "", label: "—" };

  const buildRow = (): StoreProductUpsertRow => ({
    ...(row ? { id: row.id } : {}),
    name: name.trim(),
    description: description.trim(),
    sellerId: sellerId.trim(),
    subCategoryId: Number(subCategoryId),
    brand: strOrNull(brand),
    color: strOrNull(color),
    price: Number(price) || 0,
    stock: Number(stock) || 0,
    hasOffer,
    offerPrice: numOrNull(offerPrice),
    sku: strOrNull(sku),
    barcode: strOrNull(barcode),
    isActive,
    badges: splitList(badges).map((b) => b.toUpperCase()) as Badge[],
    featuredFrom: fromDateInput(featuredFrom),
    featuredUntil: fromDateInput(featuredUntil),
    images: splitList(images),
    materialComposition: strOrNull(materialComposition),
    recycledContent: numOrNull(recycledContent),
    weight: numOrNull(weight),
    weightUnit: weightUnit ? (weightUnit as WeightUnit) : null,
    length: numOrNull(length),
    width: numOrNull(width),
    height: numOrNull(height),
    dimensionUnit: dimensionUnit ? (dimensionUnit as DimensionUnit) : null,
    lowStockThreshold: numOrNull(lowStockThreshold),
    isLowStock,
    tags: splitList(tags),
    metaTitle: strOrNull(metaTitle),
    metaDescription: strOrNull(metaDescription),
    warranty,
    warrantyDuration: numOrNull(warrantyDuration),
    features: splitList(features),
  });

  const save = async () => {
    if (!canSave) return;
    const result = await upsertStoreProducts([buildRow()]);
    if (!result || result.failed > 0) return;
    if (!row && result.createdIds[0] != null) {
      navigateTo({ route: storeProductPaths.edit(lang, result.createdIds[0]) });
      return;
    }
    onSaved();
  };

  const deleteRow = async () => {
    if (!row) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    if (await removeStoreProduct(row.id)) {
      navigateTo({ route: storeProductPaths.list(lang) });
    }
  };

  return (
    <FormShell
      backHref={storeProductPaths.list(lang)}
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
            label={t("fields.subCategory")}
            placeholder={optionsLoading ? tc("common.loading") : undefined}
            value={subCategoryId}
            options={subCategoryOptions}
            onChangeValue={setSubCategoryId}
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
          <Input
            name="stock"
            type="number"
            label={t("fields.stock")}
            value={stock}
            onChangeText={setStock}
          />
          <Input
            name="offerPrice"
            type="number"
            label={t("fields.offerPrice")}
            value={offerPrice}
            onChangeText={setOfferPrice}
          />
          <Input name="sku" label={t("fields.sku")} value={sku} onChangeText={setSku} />
          <Input
            name="barcode"
            label={t("fields.barcode")}
            value={barcode}
            onChangeText={setBarcode}
          />
        </div>
        <Checkbox
          name="hasOffer"
          label={t("fields.hasOffer")}
          checked={hasOffer}
          onChange={setHasOffer}
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
        <Input
          name="badges"
          label={t("fields.badges")}
          placeholder={t("fields.badgesHint")}
          value={badges}
          onChangeText={setBadges}
        />
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

      <section className={card}>
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.specs")}
        </Title>
        <Input
          name="materialComposition"
          label={t("fields.materialComposition")}
          value={materialComposition}
          onChangeText={setMaterialComposition}
        />
        <div className={grid3}>
          <Input
            name="recycledContent"
            type="number"
            label={t("fields.recycledContent")}
            value={recycledContent}
            onChangeText={setRecycledContent}
          />
          <Input
            name="weight"
            type="number"
            label={t("fields.weight")}
            value={weight}
            onChangeText={setWeight}
          />
          <Select
            label={t("fields.weightUnit")}
            value={weightUnit}
            options={[emptyUnit, ...WEIGHT_UNITS.map((u) => ({ value: u, label: u }))]}
            onChangeValue={setWeightUnit}
          />
          <Input
            name="length"
            type="number"
            label={t("fields.length")}
            value={length}
            onChangeText={setLength}
          />
          <Input
            name="width"
            type="number"
            label={t("fields.width")}
            value={width}
            onChangeText={setWidth}
          />
          <Input
            name="height"
            type="number"
            label={t("fields.height")}
            value={height}
            onChangeText={setHeight}
          />
          <Select
            label={t("fields.dimensionUnit")}
            value={dimensionUnit}
            options={[emptyUnit, ...DIMENSION_UNITS.map((u) => ({ value: u, label: u }))]}
            onChangeValue={setDimensionUnit}
          />
          <Input
            name="lowStockThreshold"
            type="number"
            label={t("fields.lowStockThreshold")}
            value={lowStockThreshold}
            onChangeText={setLowStockThreshold}
          />
        </div>
        <Checkbox
          name="isLowStock"
          label={t("fields.isLowStock")}
          checked={isLowStock}
          onChange={setIsLowStock}
        />
      </section>

      <section className={card}>
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.seo")}
        </Title>
        <Input
          name="tags"
          label={t("fields.tags")}
          placeholder={t("fields.listHint")}
          value={tags}
          onChangeText={setTags}
        />
        <Input
          name="metaTitle"
          label={t("fields.metaTitle")}
          value={metaTitle}
          onChangeText={setMetaTitle}
        />
        <Textarea
          name="metaDescription"
          label={t("fields.metaDescription")}
          value={metaDescription}
          onChangeText={setMetaDescription}
          rows={2}
        />
      </section>

      <section className={card}>
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.additional")}
        </Title>
        <div className={grid3}>
          <Input
            name="warrantyDuration"
            type="number"
            label={t("fields.warrantyDuration")}
            value={warrantyDuration}
            onChangeText={setWarrantyDuration}
          />
        </div>
        <Checkbox
          name="warranty"
          label={t("fields.warranty")}
          checked={warranty}
          onChange={setWarranty}
        />
        <Textarea
          name="features"
          label={t("fields.features")}
          placeholder={t("fields.listHint")}
          value={features}
          onChangeText={setFeatures}
          rows={3}
        />
      </section>

      {row && (
        <section className={card}>
          <Title level="h2" size="h6" weight="semibold">
            {t("sections.metrics")}
          </Title>
          <Text variant="small" color="tertiary">
            {`${t("fields.averageRating")}: ${row.averageRating} · ${t("fields.reviewsNumber")}: ${row.reviewsNumber} · ${t("fields.likesCount")}: ${row.likesCount} · ${t("fields.saleCount")}: ${row.saleCount} · ${t("fields.viewCount")}: ${row.viewCount}`}
          </Text>
        </section>
      )}

      {row && (
        <>
          <StoreProductMaterialsEditor
            storeProductId={row.id}
            materials={row.materials}
            onChanged={onSaved}
          />
          <StoreProductVariantsEditor
            storeProductId={row.id}
            variants={row.variants}
            onChanged={onSaved}
          />
        </>
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

/** Create (no id) or edit (id) screen for a store product. */
export function StoreProductFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("storeProducts");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawStoreProduct(id ?? Number.NaN);

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
      <StoreProductForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
