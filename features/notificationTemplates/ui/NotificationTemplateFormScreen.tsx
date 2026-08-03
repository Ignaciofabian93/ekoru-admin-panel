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
import { useNotificationTemplate } from "../hooks/useNotificationTemplates";
import { useNotificationTemplateMutations } from "../hooks/useNotificationTemplateMutations";
import { notificationTemplatePaths } from "../paths";
import {
  NOTIFICATION_TYPES,
  type NotificationTemplate,
  type NotificationTemplateUpsertRow,
} from "../types";
import { NotificationTemplateTranslations } from "./NotificationTemplateTranslations";

const card =
  "flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm";

function NotificationTemplateForm({
  lang,
  template,
  onSaved,
}: {
  lang: SupportedLanguage;
  template: NotificationTemplate | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("notificationTemplates");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { loading, upsertTemplates, deleteTemplate } = useNotificationTemplateMutations();

  const [type, setType] = useState(template?.type ?? "");
  const [title, setTitle] = useState(template?.title ?? "");
  const [message, setMessage] = useState(template?.message ?? "");
  const [isActive, setIsActive] = useState(template?.isActive ?? true);

  const canSave =
    title.trim() !== "" && message.trim() !== "" && (template != null || type !== "");

  const save = async () => {
    if (!canSave) return;
    const row: NotificationTemplateUpsertRow = template
      ? {
          id: template.id,
          title: title.trim(),
          message: message.trim(),
          isActive,
        }
      : {
          type,
          title: title.trim(),
          message: message.trim(),
          isActive,
        };
    const result = await upsertTemplates([row]);
    if (!result || result.failed > 0) return;
    if (!template && result.createdIds[0] != null) {
      navigateTo({
        route: notificationTemplatePaths.edit(lang, result.createdIds[0]),
      });
      return;
    }
    onSaved();
  };

  const deleteRow = async () => {
    if (!template) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    if (await deleteTemplate(template.id))
      navigateTo({ route: notificationTemplatePaths.list(lang) });
  };

  return (
    <FormShell
      backHref={notificationTemplatePaths.list(lang)}
      backLabel={t("actions.backToList")}
      title={template ? t("editTitle", { id: String(template.id) }) : t("newTitle")}
      subtitle={t("formSubtitle")}
      actions={
        template ? (
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
        {template ? (
          <div className="flex flex-col gap-1">
            <Text variant="small" color="tertiary">
              {t("fields.type")}
            </Text>
            <Text variant="span" weight="semibold">
              {template.type}
            </Text>
          </div>
        ) : (
          <Select
            name="type"
            label={t("fields.type")}
            options={NOTIFICATION_TYPES.map((o) => ({ value: o, label: o }))}
            value={type}
            onChangeValue={setType}
          />
        )}
        <Input
          name="title"
          label={t("fields.title")}
          value={title}
          onChangeText={setTitle}
        />
        <Textarea
          name="message"
          label={t("fields.message")}
          rows={3}
          value={message}
          onChangeText={setMessage}
        />
        <Checkbox
          name="isActive"
          label={t("fields.isActive")}
          checked={isActive}
          onChange={setIsActive}
        />
      </section>

      {template ? (
        <NotificationTemplateTranslations template={template} onChanged={onSaved} />
      ) : (
        <Text variant="small" color="tertiary">
          {t("translations.saveHintNew")}
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

/** Create (no id) or edit (id) screen for a notification template. */
export function NotificationTemplateFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("notificationTemplates");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { template, loading, refetch } = useNotificationTemplate(id);

  if (isEdit && loading && !template) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {tc("common.loading")}
        </Text>
      </div>
    );
  }
  if (isEdit && !loading && !template) {
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
      <NotificationTemplateForm
        key={
          template
            ? `${template.id}-${template.updatedAt ?? ""}-${template.translations?.length ?? 0}`
            : "new"
        }
        lang={lang}
        template={template}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
