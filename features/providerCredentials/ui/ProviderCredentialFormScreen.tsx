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
import { Text } from "@/components/Text/Text";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useRawProviderCredential } from "../hooks/useRawProviderCredentials";
import { useProviderCredentialMutations } from "../hooks/useProviderCredentialMutations";
import { providerCredentialPaths } from "../paths";
import type { ProviderCredentialsUpsertRow, RawProviderCredentials } from "../types";

const card =
  "flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm";

const initDate = (iso: string | null): string => (iso ? iso.slice(0, 10) : "");
const strOrNull = (v: string): string | null => (v.trim() === "" ? null : v.trim());
const dateOrNull = (v: string): string | null => (v === "" ? null : v);

function CredentialsForm({
  lang,
  record,
  onSaved,
}: {
  lang: SupportedLanguage;
  record: RawProviderCredentials | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("providerCredentials");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { loading, upsert, remove } = useProviderCredentialMutations();

  const [sellerId, setSellerId] = useState(record?.sellerId ?? "");
  const [licenseNumber, setLicenseNumber] = useState(record?.licenseNumber ?? "");
  const [licenseType, setLicenseType] = useState(record?.licenseType ?? "");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState(
    initDate(record?.licenseExpiryDate ?? null),
  );
  const [isLicenseVerified, setIsLicenseVerified] = useState(
    record?.isLicenseVerified ?? false,
  );
  const [insuranceProvider, setInsuranceProvider] = useState(
    record?.insuranceProvider ?? "",
  );
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState(
    record?.insurancePolicyNumber ?? "",
  );
  const [insuranceExpiryDate, setInsuranceExpiryDate] = useState(
    initDate(record?.insuranceExpiryDate ?? null),
  );
  const [insuranceCoverage, setInsuranceCoverage] = useState(
    record?.insuranceCoverage != null ? String(record.insuranceCoverage) : "",
  );
  const [backgroundCheckDate, setBackgroundCheckDate] = useState(
    initDate(record?.backgroundCheckDate ?? null),
  );
  const [backgroundCheckStatus, setBackgroundCheckStatus] = useState(
    record?.backgroundCheckStatus ?? "",
  );

  const canSave = sellerId.trim() !== "";

  const buildRow = (): ProviderCredentialsUpsertRow => ({
    ...(record ? { id: record.id } : {}),
    sellerId: sellerId.trim(),
    licenseNumber: strOrNull(licenseNumber),
    licenseType: strOrNull(licenseType),
    licenseExpiryDate: dateOrNull(licenseExpiryDate),
    isLicenseVerified,
    insuranceProvider: strOrNull(insuranceProvider),
    insurancePolicyNumber: strOrNull(insurancePolicyNumber),
    insuranceExpiryDate: dateOrNull(insuranceExpiryDate),
    insuranceCoverage: insuranceCoverage.trim() === "" ? null : Number(insuranceCoverage),
    backgroundCheckDate: dateOrNull(backgroundCheckDate),
    backgroundCheckStatus: strOrNull(backgroundCheckStatus),
  });

  const save = async () => {
    if (!canSave) return;
    const result = await upsert([buildRow()]);
    if (!result || result.failed > 0) return;
    if (!record && result.createdIds[0] != null) {
      navigateTo({ route: providerCredentialPaths.edit(lang, result.createdIds[0]) });
      return;
    }
    onSaved();
  };

  const deleteRow = async () => {
    if (!record) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    if (await remove(record.id))
      navigateTo({ route: providerCredentialPaths.list(lang) });
  };

  return (
    <FormShell
      backHref={providerCredentialPaths.list(lang)}
      backLabel={t("actions.backToList")}
      title={record ? t("editTitle", { id: String(record.id) }) : t("newTitle")}
      subtitle={t("formSubtitle")}
      actions={
        record ? (
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
        <Input
          name="sellerId"
          label={t("fields.sellerId")}
          value={sellerId}
          onChangeText={setSellerId}
        />
      </section>

      <section className={card}>
        <Text variant="span" weight="semibold" color="tertiary">
          {t("sections.license")}
        </Text>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            name="licenseNumber"
            label={t("fields.licenseNumber")}
            value={licenseNumber}
            onChangeText={setLicenseNumber}
          />
          <Input
            name="licenseType"
            label={t("fields.licenseType")}
            value={licenseType}
            onChangeText={setLicenseType}
          />
          <Input
            name="licenseExpiryDate"
            type="date"
            label={t("fields.licenseExpiryDate")}
            value={licenseExpiryDate}
            onChangeText={setLicenseExpiryDate}
          />
        </div>
        <Checkbox
          name="isLicenseVerified"
          label={t("fields.isLicenseVerified")}
          checked={isLicenseVerified}
          onChange={setIsLicenseVerified}
        />
      </section>

      <section className={card}>
        <Text variant="span" weight="semibold" color="tertiary">
          {t("sections.insurance")}
        </Text>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            name="insuranceProvider"
            label={t("fields.insuranceProvider")}
            value={insuranceProvider}
            onChangeText={setInsuranceProvider}
          />
          <Input
            name="insurancePolicyNumber"
            label={t("fields.insurancePolicyNumber")}
            value={insurancePolicyNumber}
            onChangeText={setInsurancePolicyNumber}
          />
          <Input
            name="insuranceExpiryDate"
            type="date"
            label={t("fields.insuranceExpiryDate")}
            value={insuranceExpiryDate}
            onChangeText={setInsuranceExpiryDate}
          />
          <Input
            name="insuranceCoverage"
            type="number"
            label={t("fields.insuranceCoverage")}
            value={insuranceCoverage}
            onChangeText={setInsuranceCoverage}
          />
        </div>
      </section>

      <section className={card}>
        <Text variant="span" weight="semibold" color="tertiary">
          {t("sections.background")}
        </Text>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            name="backgroundCheckDate"
            type="date"
            label={t("fields.backgroundCheckDate")}
            value={backgroundCheckDate}
            onChangeText={setBackgroundCheckDate}
          />
          <Input
            name="backgroundCheckStatus"
            label={t("fields.backgroundCheckStatus")}
            value={backgroundCheckStatus}
            onChangeText={setBackgroundCheckStatus}
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

/** Create (no id) or edit (id) screen for provider credentials. */
export function ProviderCredentialFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("providerCredentials");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawProviderCredential(id ?? Number.NaN);

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
      permission="VIEW_USER_DATA"
      fallback={<AccessDenied />}
    >
      <CredentialsForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        record={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
