"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import Textarea from "@/components/Textarea/Textarea";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { BACKEND_LANGUAGES, type BackendLanguage } from "@/utils/language";
import { useNotificationTemplateMutations } from "../hooks/useNotificationTemplateMutations";
import type { NotificationTemplate, NotificationTemplateTranslation } from "../types";

function TranslationRow({
  code,
  existing,
  templateId,
  onChanged,
}: {
  code: BackendLanguage;
  existing?: NotificationTemplateTranslation;
  templateId: number;
  onChanged: () => void;
}) {
  const { t } = useTranslation("notificationTemplates");
  const { upsertTranslations, deleteTranslation, loading } =
    useNotificationTemplateMutations();
  const [title, setTitle] = useState(existing?.title ?? "");
  const [message, setMessage] = useState(existing?.message ?? "");

  const save = async () => {
    if (!title.trim() || !message.trim()) return;
    const result = await upsertTranslations([
      {
        notificationTemplateId: templateId,
        language: code,
        title: title.trim(),
        message: message.trim(),
      },
    ]);
    if (result && result.failed === 0) onChanged();
  };

  const remove = async () => {
    if (!window.confirm(t("translations.deleteConfirm"))) return;
    if (await deleteTranslation(templateId, code)) onChanged();
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
        name={`tr-title-${code}`}
        label={t("translations.titleField")}
        value={title}
        onChangeText={setTitle}
      />
      <Textarea
        name={`tr-message-${code}`}
        label={t("translations.messageField")}
        rows={3}
        value={message}
        onChangeText={setMessage}
      />
      <div className="flex justify-end">
        <MainButton
          text={t("translations.save")}
          size="sm"
          loading={loading}
          disabled={!title.trim() || !message.trim()}
          onPress={save}
        />
      </div>
    </div>
  );
}

/** Per-language title/message overrides for one template. */
export function NotificationTemplateTranslations({
  template,
  onChanged,
}: {
  template: NotificationTemplate;
  onChanged: () => void;
}) {
  const { t } = useTranslation("notificationTemplates");
  const byLang = (code: BackendLanguage) =>
    template.translations?.find((tr) => tr.language === code);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-1">
        <Title level="h2" size="h6" weight="semibold">
          {t("translations.title")}
        </Title>
        <Text variant="small" color="secondary">
          {t("translations.hint")}
        </Text>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {BACKEND_LANGUAGES.map((code) => {
          const existing = byLang(code);
          return (
            <TranslationRow
              key={`${code}-${existing?.title ?? ""}-${existing?.message ?? ""}`}
              code={code}
              existing={existing}
              templateId={template.id}
              onChanged={onChanged}
            />
          );
        })}
      </div>
    </section>
  );
}
