"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_NOTIFICATION_TEMPLATES,
  BULK_UPSERT_NOTIFICATION_TEMPLATE_TRANSLATIONS,
  DELETE_NOTIFICATION_TEMPLATE,
  DELETE_NOTIFICATION_TEMPLATE_TRANSLATION,
} from "@/graphql/notificationTemplates/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { BackendLanguage } from "@/utils/language";
import type {
  BulkUpsertResult,
  NotificationTemplateTranslationUpsertRow,
  NotificationTemplateUpsertRow,
} from "../types";

/**
 * Writes for notification templates + translations. The bulk mutations back
 * both the row-edit forms (a one-row array) and the XLSX import (many rows).
 * With `notify` (default) a clean batch toasts success and a batch with row
 * failures toasts the first error; pass `notify: false` when the caller reports
 * results itself (the import dialog).
 */
export function useNotificationTemplateMutations() {
  const toast = useToast();
  const { t } = useTranslation("notificationTemplates");

  const [upsertTemplatesM, s1] = useMutation<Record<string, BulkUpsertResult>>(
    BULK_UPSERT_NOTIFICATION_TEMPLATES,
  );
  const [deleteTemplateM, s2] = useMutation(DELETE_NOTIFICATION_TEMPLATE);
  const [upsertTrM, s3] = useMutation<Record<string, BulkUpsertResult>>(
    BULK_UPSERT_NOTIFICATION_TEMPLATE_TRANSLATIONS,
  );
  const [deleteTrM, s4] = useMutation(DELETE_NOTIFICATION_TEMPLATE_TRANSLATION);
  const loading = s1.loading || s2.loading || s3.loading || s4.loading;

  const runBulk = async (
    call: () => Promise<{ data?: Record<string, BulkUpsertResult> | null }>,
    field: string,
    notify: boolean,
  ): Promise<BulkUpsertResult | null> => {
    try {
      const { data } = await call();
      const result = data?.[field] ?? null;
      if (notify) {
        if (!result) toast.error(t("feedback.error"));
        else if (result.failed > 0)
          toast.error(
            t("feedback.rowsFailed", {
              count: String(result.failed),
              message: result.errors[0]?.message ?? "",
            }),
          );
        else toast.success(t("feedback.saved"));
      }
      return result;
    } catch (error) {
      if (notify) {
        const message = error instanceof Error ? error.message : "";
        toast.error(message || t("feedback.error"));
      }
      return null;
    }
  };

  const upsertTemplates = (rows: NotificationTemplateUpsertRow[], notify = true) =>
    runBulk(
      () => upsertTemplatesM({ variables: { rows } }),
      "bulkUpsertNotificationTemplates",
      notify,
    );

  const upsertTranslations = (
    rows: NotificationTemplateTranslationUpsertRow[],
    notify = true,
  ) =>
    runBulk(
      () => upsertTrM({ variables: { rows } }),
      "bulkUpsertNotificationTemplateTranslations",
      notify,
    );

  const deleteTemplate = async (id: number): Promise<boolean> => {
    try {
      await deleteTemplateM({ variables: { id } });
      toast.success(t("feedback.deleted"));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(message || t("feedback.error"));
      return false;
    }
  };

  const deleteTranslation = async (
    notificationTemplateId: number,
    translationLanguage: BackendLanguage,
  ): Promise<boolean> => {
    try {
      await deleteTrM({
        variables: { notificationTemplateId, translationLanguage },
      });
      toast.success(t("feedback.deleted"));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(message || t("feedback.error"));
      return false;
    }
  };

  return {
    loading,
    upsertTemplates,
    upsertTranslations,
    deleteTemplate,
    deleteTranslation,
  };
}
