"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { FormShell } from "@/components/FormShell/FormShell";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import { Textarea } from "@/components/Textarea/Textarea";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useImpactMutations } from "../hooks/useImpactMutations";
import { useRawMessage } from "../hooks/useImpact";
import { impactPaths } from "../paths";
import {
  CATALOG_LANGUAGES,
  messageParentKey,
  type CatalogLanguage,
  type ImpactMessageKind,
  type ImpactMessageTranslation,
  type RawImpactMessage,
} from "../types";

type MessageValues = { message1: string; message2: string; message3: string };

function TranslationCard({
  code,
  existing,
  saving,
  onSave,
  onDelete,
}: {
  code: CatalogLanguage;
  existing: ImpactMessageTranslation | null;
  saving: boolean;
  onSave: (code: CatalogLanguage, values: MessageValues) => Promise<unknown>;
  onDelete: (id: number) => Promise<unknown>;
}) {
  const { t } = useTranslation("impact");
  const [m1, setM1] = useState(existing?.message1 ?? "");
  const [m2, setM2] = useState(existing?.message2 ?? "");
  const [m3, setM3] = useState(existing?.message3 ?? "");

  const canSave = !!m1.trim() && !!m2.trim() && !!m3.trim();

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-light p-3">
      <div className="flex items-center justify-between">
        <Text variant="small" color="tertiary" weight="semibold">
          {code}
          {existing ? ` · #${existing.id}` : ` · ${t("translations.missing")}`}
        </Text>
        {existing && (
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("translations.delete")}
            disabled={saving}
            onClick={() => {
              if (window.confirm(t("translations.deleteConfirm")))
                void onDelete(existing.id);
            }}
          />
        )}
      </div>
      <Textarea
        name={`tr-m1-${code}`}
        label={t("fields.message1")}
        value={m1}
        onChangeText={setM1}
        rows={2}
      />
      <Textarea
        name={`tr-m2-${code}`}
        label={t("fields.message2")}
        value={m2}
        onChangeText={setM2}
        rows={2}
      />
      <Textarea
        name={`tr-m3-${code}`}
        label={t("fields.message3")}
        value={m3}
        onChangeText={setM3}
        rows={2}
      />
      <div className="flex justify-end">
        <MainButton
          text={t("translations.save")}
          size="sm"
          loading={saving}
          disabled={!canSave}
          onPress={() =>
            void onSave(code, {
              message1: m1.trim(),
              message2: m2.trim(),
              message3: m3.trim(),
            })
          }
        />
      </div>
    </div>
  );
}

function ImpactMessageForm({
  lang,
  kind,
  row,
  onSaved,
}: {
  lang: SupportedLanguage;
  kind: ImpactMessageKind;
  row: RawImpactMessage | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("impact");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const kindLabel = t(`kind.${kind}`);
  const {
    loading,
    upsertMessages,
    upsertMessageTranslations,
    removeMessage,
    removeMessageTranslation,
  } = useImpactMutations();

  const [min, setMin] = useState(row ? String(row.min) : "0");
  const [max, setMax] = useState(row ? String(row.max) : "0");
  const [m1, setM1] = useState(row?.message1 ?? "");
  const [m2, setM2] = useState(row?.message2 ?? "");
  const [m3, setM3] = useState(row?.message3 ?? "");

  const canSave = !!m1.trim() && !!m2.trim() && !!m3.trim();

  const saveBase = async () => {
    if (!canSave) return;
    const result = await upsertMessages(kind, [
      {
        ...(row ? { id: row.id } : {}),
        min: Number(min) || 0,
        max: Number(max) || 0,
        message1: m1.trim(),
        message2: m2.trim(),
        message3: m3.trim(),
      },
    ]);
    if (!result || result.failed > 0) return;
    if (!row && result.createdIds[0] != null) {
      navigateTo({
        route: impactPaths.messageEdit(lang, kind, result.createdIds[0]),
      });
      return;
    }
    onSaved();
  };

  const saveTranslation = async (code: CatalogLanguage, values: MessageValues) => {
    if (!row) return;
    const result = await upsertMessageTranslations(kind, [
      { [messageParentKey(kind)]: row.id, language: code, ...values },
    ]);
    if (result && result.failed === 0) onSaved();
  };

  const deleteTranslation = async (id: number) => {
    if (await removeMessageTranslation(kind, id)) onSaved();
  };

  const deleteRow = async () => {
    if (!row) return;
    if (!window.confirm(t("messages.deleteConfirm", { kind: kindLabel }))) return;
    if (await removeMessage(kind, row.id)) {
      navigateTo({ route: impactPaths.messages(lang, kind) });
    }
  };

  return (
    <FormShell
      backHref={impactPaths.messages(lang, kind)}
      backLabel={t("actions.backToList")}
      title={
        row
          ? t("messages.editTitle", { kind: kindLabel, id: String(row.id) })
          : t("messages.newTitle", { kind: kindLabel })
      }
      subtitle={t("messages.formSubtitle")}
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
      <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.baseData")}
        </Title>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input
            name="min"
            type="number"
            label={t("fields.min")}
            value={min}
            onChangeText={setMin}
          />
          <Input
            name="max"
            type="number"
            label={t("fields.max")}
            value={max}
            onChangeText={setMax}
          />
        </div>
        <Textarea
          name="message1"
          label={t("fields.message1")}
          value={m1}
          onChangeText={setM1}
          rows={2}
        />
        <Textarea
          name="message2"
          label={t("fields.message2")}
          value={m2}
          onChangeText={setM2}
          rows={2}
        />
        <Textarea
          name="message3"
          label={t("fields.message3")}
          value={m3}
          onChangeText={setM3}
          rows={2}
        />
        <div className="flex justify-end">
          <MainButton
            text={tc("common.save")}
            size="sm"
            loading={loading}
            disabled={!canSave}
            onPress={() => void saveBase()}
          />
        </div>
      </section>

      {row ? (
        <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
          <Title level="h2" size="h6" weight="semibold">
            {t("translations.title")}
          </Title>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {CATALOG_LANGUAGES.map((code) => {
              const existing =
                row.translations.find((tr) => tr.language === code) ?? null;
              return (
                <TranslationCard
                  key={`${code}-${existing?.id ?? "new"}-${existing?.message1 ?? ""}`}
                  code={code}
                  existing={existing}
                  saving={loading}
                  onSave={saveTranslation}
                  onDelete={deleteTranslation}
                />
              );
            })}
          </div>
        </section>
      ) : (
        <Text variant="small" color="tertiary">
          {t("translations.saveBaseFirst")}
        </Text>
      )}
    </FormShell>
  );
}

/** Create (no id) or edit (id) screen for a water/CO2 impact message. */
export function ImpactMessageFormScreen({
  lang,
  kind,
  id,
}: {
  lang: SupportedLanguage;
  kind: ImpactMessageKind;
  id?: number;
}) {
  const { t } = useTranslation("impact");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawMessage(kind, id ?? Number.NaN);

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
      <ImpactMessageForm
        key={row ? `${kind}-${row.id}-${row.updatedAt}` : `${kind}-new`}
        lang={lang}
        kind={kind}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
