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
import type { SellerLevel, SellerLevelTranslation } from "@/types/account";
import { useSellerLevelMutations } from "../hooks/useSellerLevelMutations";

function TranslationRow({
  code,
  existing,
  levelId,
  onChanged,
}: {
  code: BackendLanguage;
  existing?: SellerLevelTranslation;
  levelId: number;
  onChanged: () => void;
}) {
  const { t } = useTranslation("sellerLevels");
  const { upsertTranslation, deleteTranslation, loading } = useSellerLevelMutations();
  const [levelName, setLevelName] = useState(existing?.levelName ?? "");

  const save = async () => {
    if (!levelName.trim()) return;
    const ok = await upsertTranslation({
      sellerLevelId: levelId,
      language: code,
      levelName: levelName.trim(),
    });
    if (ok) onChanged();
  };

  const remove = async () => {
    if (!window.confirm(t("translations.deleteConfirm"))) return;
    const ok = await deleteTranslation(levelId, code);
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
        label={t("translations.levelName")}
        value={levelName}
        onChangeText={setLevelName}
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

export function LevelTranslations({
  level,
  onChanged,
}: {
  level: SellerLevel;
  onChanged: () => void;
}) {
  const { t } = useTranslation("sellerLevels");
  const byLang = (code: BackendLanguage) =>
    level.translations?.find((tr) => tr.language === code);

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
              key={`${code}-${existing?.levelName ?? ""}`}
              code={code}
              existing={existing}
              levelId={level.id}
              onChanged={onChanged}
            />
          );
        })}
      </div>
    </section>
  );
}
