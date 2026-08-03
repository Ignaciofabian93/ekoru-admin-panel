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
import { useRawSearchRow } from "../hooks/useRawSearchConfig";
import { useSearchConfigMutations } from "../hooks/useSearchConfigMutations";
import { searchConfigPaths } from "../paths";
import {
  KIND_CONFIG,
  type FieldSpec,
  type SearchKind,
  type SearchRow,
  type SearchUpsertRow,
} from "../types";

const card =
  "flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm";

/** Initial string value of a field from the row (booleans handled separately). */
function initialText(row: SearchRow | null, f: FieldSpec): string {
  if (!row) return "";
  const v = row[f.key];
  return v == null ? "" : String(v);
}

function SearchConfigForm({
  kind,
  lang,
  row,
  onSaved,
}: {
  kind: SearchKind;
  lang: SupportedLanguage;
  row: SearchRow | null;
  onSaved: () => void;
}) {
  const cfg = KIND_CONFIG[kind];
  const paths = searchConfigPaths(kind);
  const { t } = useTranslation("searchConfig");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { loading, upsert, remove } = useSearchConfigMutations(kind);

  // Text fields as strings; booleans as their own state map.
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      cfg.fields
        .filter((f) => f.type !== "bool")
        .map((f) => [f.key, initialText(row, f)]),
    ),
  );
  const [bools, setBools] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      cfg.fields
        .filter((f) => f.type === "bool")
        .map((f) => [f.key, row ? Boolean(row[f.key]) : true]),
    ),
  );

  const setValue = (key: string, v: string) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const canSave = cfg.fields
    .filter((f) => f.requiredForCreate)
    .every((f) => (values[f.key] ?? "").trim() !== "");

  const buildRow = (): SearchUpsertRow => {
    const out: SearchUpsertRow = row ? { id: row.id } : {};
    for (const f of cfg.fields) {
      if (f.type === "bool") {
        out[f.key] = bools[f.key];
      } else {
        const raw = (values[f.key] ?? "").trim();
        if (f.type === "int") out[f.key] = raw === "" ? null : Number(raw);
        else if (f.type === "float") out[f.key] = raw === "" ? null : Number(raw);
        else out[f.key] = raw === "" ? null : raw;
      }
    }
    return out;
  };

  const save = async () => {
    if (!canSave) return;
    const result = await upsert([buildRow()]);
    if (!result || result.failed > 0) return;
    if (!row && result.createdIds[0] != null) {
      navigateTo({ route: paths.edit(lang, result.createdIds[0]) });
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
          f.type === "bool" ? (
            <Checkbox
              key={f.key}
              name={f.key}
              label={t(`fields.${f.key}`)}
              checked={bools[f.key] ?? false}
              onChange={(v) => setBools((prev) => ({ ...prev, [f.key]: v }))}
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

/** Create (no id) or edit (id) screen for a search-config row. */
export function SearchConfigFormScreen({
  kind,
  lang,
  id,
}: {
  kind: SearchKind;
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("searchConfig");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { row, loading, refetch } = useRawSearchRow(kind, id ?? Number.NaN);

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
      <SearchConfigForm
        key={row ? `${row.id}-${row.updatedAt}` : "new"}
        kind={kind}
        lang={lang}
        row={row}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
