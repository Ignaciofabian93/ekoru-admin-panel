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
import { useRawService } from "../hooks/useRawServices";
import { useServiceMutations } from "../hooks/useServiceMutations";
import { servicePaths } from "../paths";
import {
  SERVICE_PRICING,
  type RawService,
  type ServicePricing,
  type ServiceUpsertRow,
} from "../types";
import { ServiceMediaEditor } from "./ServiceMediaEditor";
import { ServiceFaqEditor } from "./ServiceFaqEditor";

const card =
  "flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm";

const splitList = (v: string): string[] =>
  v
    .split(/[|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

const numOrNull = (v: string): number | null => (v.trim() === "" ? null : Number(v));

function ServiceForm({
  lang,
  service,
  onSaved,
}: {
  lang: SupportedLanguage;
  service: RawService | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("services");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { loading, upsertServices, removeService } = useServiceMutations();

  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [sellerId, setSellerId] = useState(service?.sellerId ?? "");
  const [subcategoryId, setSubcategoryId] = useState(
    service ? String(service.subcategoryId) : "",
  );
  const [pricingType, setPricingType] = useState<ServicePricing>(
    service?.pricingType ?? "QUOTATION",
  );
  const [basePrice, setBasePrice] = useState(
    service?.basePrice != null ? String(service.basePrice) : "",
  );
  const [priceRange, setPriceRange] = useState(service?.priceRange ?? "");
  const [duration, setDuration] = useState(
    service?.duration != null ? String(service.duration) : "",
  );
  const [images, setImages] = useState((service?.images ?? []).join(" | "));
  const [tags, setTags] = useState((service?.tags ?? []).join(" | "));
  const [maxConcurrentBookings, setMaxConcurrentBookings] = useState(
    service?.maxConcurrentBookings != null ? String(service.maxConcurrentBookings) : "",
  );
  const [advanceBookingDays, setAdvanceBookingDays] = useState(
    service?.advanceBookingDays != null ? String(service.advanceBookingDays) : "",
  );
  const [serviceRadius, setServiceRadius] = useState(
    service?.serviceRadius != null ? String(service.serviceRadius) : "",
  );
  const [isActive, setIsActive] = useState(service?.isActive ?? true);
  const [isRemoteService, setIsRemoteService] = useState(
    service?.isRemoteService ?? false,
  );
  const [isCurrentlyAvailable, setIsCurrentlyAvailable] = useState(
    service?.isCurrentlyAvailable ?? true,
  );

  const canSave =
    name.trim() !== "" && sellerId.trim() !== "" && subcategoryId.trim() !== "";

  const buildRow = (): ServiceUpsertRow => ({
    ...(service ? { id: service.id } : {}),
    name: name.trim(),
    description: description.trim() === "" ? null : description.trim(),
    sellerId: sellerId.trim(),
    subcategoryId: Number(subcategoryId),
    pricingType,
    basePrice: numOrNull(basePrice),
    priceRange: priceRange.trim() === "" ? null : priceRange.trim(),
    duration: numOrNull(duration),
    images: splitList(images),
    tags: splitList(tags),
    maxConcurrentBookings: numOrNull(maxConcurrentBookings),
    advanceBookingDays: numOrNull(advanceBookingDays),
    serviceRadius: numOrNull(serviceRadius),
    isActive,
    isRemoteService,
    isCurrentlyAvailable,
  });

  const save = async () => {
    if (!canSave) return;
    const result = await upsertServices([buildRow()]);
    if (!result || result.failed > 0) return;
    if (!service && result.createdIds[0] != null) {
      navigateTo({ route: servicePaths.edit(lang, result.createdIds[0]) });
      return;
    }
    onSaved();
  };

  const deleteRow = async () => {
    if (!service) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    if (await removeService(service.id)) navigateTo({ route: servicePaths.list(lang) });
  };

  return (
    <FormShell
      backHref={servicePaths.list(lang)}
      backLabel={t("actions.backToList")}
      title={service ? t("editTitle", { id: String(service.id) }) : t("newTitle")}
      subtitle={t("formSubtitle")}
      actions={
        service ? (
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
            name="subcategoryId"
            type="number"
            label={t("fields.subcategoryId")}
            value={subcategoryId}
            onChangeText={setSubcategoryId}
          />
          <Select
            name="pricingType"
            label={t("fields.pricingType")}
            options={SERVICE_PRICING.map((o) => ({ value: o, label: o }))}
            value={pricingType}
            onChangeValue={(v) => setPricingType(v as ServicePricing)}
          />
          <Input
            name="basePrice"
            type="number"
            label={t("fields.basePrice")}
            value={basePrice}
            onChangeText={setBasePrice}
          />
          <Input
            name="priceRange"
            label={t("fields.priceRange")}
            value={priceRange}
            onChangeText={setPriceRange}
          />
          <Input
            name="duration"
            type="number"
            label={t("fields.duration")}
            value={duration}
            onChangeText={setDuration}
          />
          <Input
            name="maxConcurrentBookings"
            type="number"
            label={t("fields.maxConcurrentBookings")}
            value={maxConcurrentBookings}
            onChangeText={setMaxConcurrentBookings}
          />
          <Input
            name="advanceBookingDays"
            type="number"
            label={t("fields.advanceBookingDays")}
            value={advanceBookingDays}
            onChangeText={setAdvanceBookingDays}
          />
          <Input
            name="serviceRadius"
            type="number"
            label={t("fields.serviceRadius")}
            value={serviceRadius}
            onChangeText={setServiceRadius}
          />
        </div>
        <Input
          name="images"
          label={t("fields.images")}
          value={images}
          onChangeText={setImages}
        />
        <Input name="tags" label={t("fields.tags")} value={tags} onChangeText={setTags} />
        <div className="flex flex-wrap gap-4">
          <Checkbox
            name="isActive"
            label={t("fields.isActive")}
            checked={isActive}
            onChange={setIsActive}
          />
          <Checkbox
            name="isRemoteService"
            label={t("fields.isRemoteService")}
            checked={isRemoteService}
            onChange={setIsRemoteService}
          />
          <Checkbox
            name="isCurrentlyAvailable"
            label={t("fields.isCurrentlyAvailable")}
            checked={isCurrentlyAvailable}
            onChange={setIsCurrentlyAvailable}
          />
        </div>
      </section>

      {service ? (
        <>
          <ServiceMediaEditor
            serviceId={service.id}
            media={service.serviceMedia}
            onChanged={onSaved}
          />
          <ServiceFaqEditor
            serviceId={service.id}
            faqs={service.serviceFAQ}
            onChanged={onSaved}
          />
        </>
      ) : (
        <Text variant="small" color="tertiary">
          {t("media.saveHintNew")}
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

/** Create (no id) or edit (id) screen for a service. */
export function ServiceFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("services");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawService(id ?? Number.NaN);

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
      <ServiceForm
        key={
          row
            ? `${row.id}-${row.updatedAt}-${row.serviceMedia.length}-${row.serviceFAQ.length}`
            : "new"
        }
        lang={lang}
        service={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
