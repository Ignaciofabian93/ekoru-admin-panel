"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import MainButton from "@/components/Button/MainButton";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { BACKEND_LANGUAGES, type BackendLanguage } from "@/utils/language";
import type { SellerLabel, SellerLabelTranslation } from "@/types/account";
import { useSellerLabelMutations } from "../hooks/useSellerLabelMutations";

function TranslationRow({
  code,
  existing,
  labelId,
  onChanged,
}: {
  code: BackendLanguage;
  existing?: SellerLabelTranslation;
  labelId: number;
  onChanged: () => void;
}) {
  const { t } = useTranslation("sellerLabels");
  const { upsertTranslation, deleteTranslation, loading } = useSellerLabelMutations();
  const [labelName, setLabelName] = useState(existing?.labelName ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");

  const save = async () => {
    if (!labelName.trim()) return;
    const ok = await upsertTranslation({
      sellerLabelId: labelId,
      language: code,
      labelName: labelName.trim(),
      description: description.trim() || undefined,
    });
    if (ok) onChanged();
  };

  const remove = async () => {
    if (!window.confirm(t("translations.deleteConfirm"))) return;
    const ok = await deleteTranslation(labelId, code);
    if (ok) onChanged();
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-light p-3">
      <div className="flex items-center justify-between">
        <Text variant="small" color="tertiary" weight="semibold">
          {t(`language.${code}`)}
        </Text>
        {existing && (
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("translations.delete")}
            disabled={loading}
            onClick={remove}
          />
        )}
      </div>
      <Input
        name={`tr-name-${code}`}
        label={t("translations.labelName")}
        value={labelName}
        onChangeText={setLabelName}
      />
      <Input
        name={`tr-desc-${code}`}
        label={t("translations.description")}
        value={description}
        onChangeText={setDescription}
      />
      <div className="flex justify-end">
        <MainButton
          text={t("translations.save")}
          size="sm"
          loading={loading}
          onPress={save}
        />
      </div>
    </div>
  );
}

export function LabelTranslations({
  label,
  onChanged,
}: {
  label: SellerLabel;
  onChanged: () => void;
}) {
  const { t } = useTranslation("sellerLabels");
  const byLang = (code: BackendLanguage) =>
    label.translations?.find((tr) => tr.language === code);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <Title level="h2" size="h6" weight="semibold">
        {t("translations.title")}
      </Title>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {BACKEND_LANGUAGES.map((code) => {
          const existing = byLang(code);
          return (
            <TranslationRow
              key={`${code}-${existing?.labelName ?? ""}-${existing?.description ?? ""}`}
              code={code}
              existing={existing}
              labelId={label.id}
              onChanged={onChanged}
            />
          );
        })}
      </div>
    </section>
  );
}
