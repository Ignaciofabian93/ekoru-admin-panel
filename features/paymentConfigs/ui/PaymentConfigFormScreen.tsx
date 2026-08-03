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
import { Text } from "@/components/Text/Text";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useRawPaymentConfig } from "../hooks/useRawPaymentConfigs";
import { usePaymentConfigMutations } from "../hooks/usePaymentConfigMutations";
import { paymentConfigPaths } from "../paths";
import {
  PAYMENT_ENVIRONMENTS,
  PAYMENT_PROVIDERS,
  type ChileanPaymentProvider,
  type PaymentConfigUpsertRow,
  type PaymentEnvironment,
  type RawPaymentConfig,
} from "../types";

const card =
  "flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm";

const strOrNull = (v: string): string | null => (v.trim() === "" ? null : v.trim());

function ConfigForm({
  lang,
  record,
  onSaved,
}: {
  lang: SupportedLanguage;
  record: RawPaymentConfig | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("paymentConfigs");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { loading, upsert, remove } = usePaymentConfigMutations();

  const [sellerId, setSellerId] = useState(record?.sellerId ?? "");
  const [provider, setProvider] = useState<ChileanPaymentProvider>(
    record?.provider ?? "KHIPU",
  );
  const [environment, setEnvironment] = useState<PaymentEnvironment>(
    record?.environment ?? "SANDBOX",
  );
  const [merchantId, setMerchantId] = useState(record?.merchantId ?? "");
  const [isActive, setIsActive] = useState(record?.isActive ?? true);
  const [apiKey, setApiKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState(record?.webhookUrl ?? "");
  const [returnUrl, setReturnUrl] = useState(record?.returnUrl ?? "");
  const [cancelUrl, setCancelUrl] = useState(record?.cancelUrl ?? "");

  const canSave = sellerId.trim() !== "";

  const buildRow = (): PaymentConfigUpsertRow => ({
    ...(record ? { id: record.id } : {}),
    sellerId: sellerId.trim(),
    provider,
    environment,
    merchantId: strOrNull(merchantId),
    isActive,
    webhookUrl: strOrNull(webhookUrl),
    returnUrl: strOrNull(returnUrl),
    cancelUrl: strOrNull(cancelUrl),
    // Write-only: only send when filled, so blank keeps the stored secret.
    ...(apiKey.trim() !== "" && { apiKey: apiKey.trim() }),
    ...(secretKey.trim() !== "" && { secretKey: secretKey.trim() }),
  });

  const save = async () => {
    if (!canSave) return;
    const result = await upsert([buildRow()]);
    if (!result || result.failed > 0) return;
    if (!record && result.createdIds[0] != null) {
      navigateTo({ route: paymentConfigPaths.edit(lang, result.createdIds[0]) });
      return;
    }
    onSaved();
  };

  const deleteRow = async () => {
    if (!record) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    if (await remove(record.id)) navigateTo({ route: paymentConfigPaths.list(lang) });
  };

  return (
    <FormShell
      backHref={paymentConfigPaths.list(lang)}
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            name="sellerId"
            label={t("fields.sellerId")}
            value={sellerId}
            onChangeText={setSellerId}
          />
          <Input
            name="merchantId"
            label={t("fields.merchantId")}
            value={merchantId}
            onChangeText={setMerchantId}
          />
          <Select
            name="provider"
            label={t("fields.provider")}
            options={PAYMENT_PROVIDERS.map((o) => ({ value: o, label: o }))}
            value={provider}
            onChangeValue={(v) => setProvider(v as ChileanPaymentProvider)}
          />
          <Select
            name="environment"
            label={t("fields.environment")}
            options={PAYMENT_ENVIRONMENTS.map((o) => ({ value: o, label: o }))}
            value={environment}
            onChangeValue={(v) => setEnvironment(v as PaymentEnvironment)}
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
        <div className="flex flex-col gap-1">
          <Text variant="span" weight="semibold" color="tertiary">
            {t("secretsSection")}
          </Text>
          <Text variant="small" color="tertiary">
            {t("secretsHint")}
          </Text>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            name="apiKey"
            type="password"
            label={t("fields.apiKey")}
            value={apiKey}
            onChangeText={setApiKey}
          />
          <Input
            name="secretKey"
            type="password"
            label={t("fields.secretKey")}
            value={secretKey}
            onChangeText={setSecretKey}
          />
        </div>
      </section>

      <section className={card}>
        <Text variant="span" weight="semibold" color="tertiary">
          {t("urlsSection")}
        </Text>
        <Input
          name="webhookUrl"
          label={t("fields.webhookUrl")}
          value={webhookUrl}
          onChangeText={setWebhookUrl}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            name="returnUrl"
            label={t("fields.returnUrl")}
            value={returnUrl}
            onChangeText={setReturnUrl}
          />
          <Input
            name="cancelUrl"
            label={t("fields.cancelUrl")}
            value={cancelUrl}
            onChangeText={setCancelUrl}
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

/** Create (no id) or edit (id) screen for a payment config. */
export function PaymentConfigFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: string;
}) {
  const { t } = useTranslation("paymentConfigs");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawPaymentConfig(id);

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
      <ConfigForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        lang={lang}
        record={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
