"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { FormShell } from "@/components/FormShell/FormShell";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import Select from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useRawTransactionConfigRow } from "../hooks/useRawTransactionConfig";
import { useTransactionConfigMutations } from "../hooks/useTransactionConfigMutations";
import { transactionConfigPaths } from "../paths";
import {
  KIND_CONFIG,
  type TxConfigKind,
  type TxFieldSpec,
  type TxRow,
  type TxUpsertRow,
} from "../types";

const card =
  "flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm";

/** Initial string value of a field from the row. */
function initialText(row: TxRow | null, f: TxFieldSpec): string {
  if (!row) return "";
  const v = row[f.key];
  return v == null ? "" : String(v);
}

function TransactionConfigForm({
  kind,
  lang,
  row,
  onSaved,
}: {
  kind: TxConfigKind;
  lang: SupportedLanguage;
  row: TxRow | null;
  onSaved: () => void;
}) {
  const cfg = KIND_CONFIG[kind];
  const paths = transactionConfigPaths(kind);
  const { t } = useTranslation("transactionConfig");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { loading, upsert, remove } = useTransactionConfigMutations(kind);

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(cfg.fields.map((f) => [f.key, initialText(row, f)])),
  );
  const setValue = (key: string, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const canSave = cfg.fields
    .filter((f) => f.requiredForCreate)
    .every((f) => (values[f.key] ?? "").trim() !== "");

  const buildRow = (): TxUpsertRow => {
    const out: TxUpsertRow = row ? { id: row.id } : {};
    for (const f of cfg.fields) {
      const raw = (values[f.key] ?? "").trim();
      if (f.type === "int") out[f.key] = raw === "" ? null : Number(raw);
      else if (f.type === "float") out[f.key] = raw === "" ? null : Number(raw);
      else out[f.key] = raw === "" ? null : raw;
    }
    return out;
  };

  const save = async () => {
    if (!canSave) return;
    const result = await upsert([buildRow()]);
    if (!result || result.failed > 0) return;
    if (!row && result.createdIds[0] != null) {
      navigateTo({ route: paths.edit(lang, String(result.createdIds[0])) });
      return;
    }
    onSaved();
  };

  const deleteRow = async () => {
    if (!row) return;
    if (!window.confirm(t(`kinds.${kind}.deleteConfirm`))) return;
    if (await remove(row.id)) navigateTo({ route: paths.list(lang) });
  };

  return (
    <FormShell
      backHref={paths.list(lang)}
      backLabel={t("actions.backToList")}
      title={
        row
          ? t(`kinds.${kind}.editTitle`, { id: String(row.id) })
          : t(`kinds.${kind}.newTitle`)
      }
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
        {cfg.fields.map((f) =>
          f.type === "enum" ? (
            <Select
              key={f.key}
              name={f.key}
              label={t(`fields.${f.key}`)}
              options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
              value={values[f.key] ?? ""}
              onChangeValue={(v) => setValue(f.key, v)}
            />
          ) : (
            <Input
              key={f.key}
              name={f.key}
              type={f.type === "string" ? "text" : "number"}
              label={t(`fields.${f.key}`)}
              value={values[f.key] ?? ""}
              onChangeText={(v) => setValue(f.key, v)}
            />
          ),
        )}
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

/** Create (no id) or edit (id) screen for a transaction-config row. */
export function TransactionConfigFormScreen({
  kind,
  lang,
  id,
}: {
  kind: TxConfigKind;
  lang: SupportedLanguage;
  id?: string;
}) {
  const { t } = useTranslation("transactionConfig");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawTransactionConfigRow(kind, id);

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
          {t(`kinds.${kind}.notFound`)}
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
      <TransactionConfigForm
        key={row ? `${row.id}-${row.updatedAt ?? ""}` : "new"}
        kind={kind}
        lang={lang}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
