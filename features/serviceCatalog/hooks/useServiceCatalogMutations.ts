"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_SERVICE_CATEGORIES,
  BULK_UPSERT_SERVICE_CATEGORY_TRANSLATIONS,
  BULK_UPSERT_SERVICE_SUB_CATEGORIES,
  BULK_UPSERT_SERVICE_SUB_CATEGORY_TRANSLATIONS,
  DELETE_SERVICE_CATEGORY,
  DELETE_SERVICE_CATEGORY_TRANSLATION,
  DELETE_SERVICE_SUB_CATEGORY,
  DELETE_SERVICE_SUB_CATEGORY_TRANSLATION,
} from "@/graphql/serviceCatalog/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type {
  BulkUpsertResult,
  ServiceCategoryTranslationUpsertRow,
  ServiceCategoryUpsertRow,
  ServiceSubCategoryTranslationUpsertRow,
  ServiceSubCategoryUpsertRow,
} from "../types";

/**
 * Writes for the service catalog tables. Each `upsert*` maps to a backend bulk
 * mutation: a one-row array is a row edit / create, a many-row array is an XLSX
 * import. With `notify` (default) a fully successful batch toasts success and a
 * batch with row failures toasts the first row error; pass `notify: false` when
 * the caller reports results itself (the import dialog).
 */
export function useServiceCatalogMutations() {
  const toast = useToast();
  const { t } = useTranslation("serviceCatalog");

  const [catM, s1] = useMutation<{
    bulkUpsertServiceCategories: BulkUpsertResult;
  }>(BULK_UPSERT_SERVICE_CATEGORIES);
  const [catTrM, s2] = useMutation<{
    bulkUpsertServiceCategoryTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_SERVICE_CATEGORY_TRANSLATIONS);
  const [subM, s3] = useMutation<{
    bulkUpsertServiceSubCategories: BulkUpsertResult;
  }>(BULK_UPSERT_SERVICE_SUB_CATEGORIES);
  const [subTrM, s4] = useMutation<{
    bulkUpsertServiceSubCategoryTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_SERVICE_SUB_CATEGORY_TRANSLATIONS);

  const [delCatM, d1] = useMutation(DELETE_SERVICE_CATEGORY);
  const [delCatTrM, d2] = useMutation(DELETE_SERVICE_CATEGORY_TRANSLATION);
  const [delSubM, d3] = useMutation(DELETE_SERVICE_SUB_CATEGORY);
  const [delSubTrM, d4] = useMutation(DELETE_SERVICE_SUB_CATEGORY_TRANSLATION);

  const loading =
    s1.loading ||
    s2.loading ||
    s3.loading ||
    s4.loading ||
    d1.loading ||
    d2.loading ||
    d3.loading ||
    d4.loading;

  const reportBulk = (
    result: BulkUpsertResult | null | undefined,
    notify: boolean,
  ): BulkUpsertResult | null => {
    if (!result) {
      if (notify) toast.error(t("feedback.error"));
      return null;
    }
    if (notify) {
      if (result.failed > 0) {
        toast.error(
          t("feedback.rowsFailed", {
            count: String(result.failed),
            message: result.errors[0]?.message ?? "",
          }),
        );
      } else {
        toast.success(t("feedback.saved"));
      }
    }
    return result;
  };

  const runBulk = async (
    action: () => Promise<BulkUpsertResult | null | undefined>,
    notify: boolean,
  ): Promise<BulkUpsertResult | null> => {
    try {
      return reportBulk(await action(), notify);
    } catch (error) {
      if (notify) {
        const message = error instanceof Error ? error.message : "";
        toast.error(message || t("feedback.error"));
      }
      return null;
    }
  };

  const runDelete = async (action: () => Promise<unknown>): Promise<boolean> => {
    try {
      await action();
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

    // ── Service categories ──
    upsertServiceCategories: (rows: ServiceCategoryUpsertRow[], notify = true) =>
      runBulk(async () => {
        const { data } = await catM({ variables: { rows } });
        return data?.bulkUpsertServiceCategories;
      }, notify),
    upsertServiceCategoryTranslations: (
      rows: ServiceCategoryTranslationUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await catTrM({ variables: { rows } });
        return data?.bulkUpsertServiceCategoryTranslations;
      }, notify),
    removeServiceCategory: (id: number) =>
      runDelete(() => delCatM({ variables: { id } })),
    removeServiceCategoryTranslation: (id: number) =>
      runDelete(() => delCatTrM({ variables: { id } })),

    // ── Service sub categories ──
    upsertServiceSubCategories: (rows: ServiceSubCategoryUpsertRow[], notify = true) =>
      runBulk(async () => {
        const { data } = await subM({ variables: { rows } });
        return data?.bulkUpsertServiceSubCategories;
      }, notify),
    upsertServiceSubCategoryTranslations: (
      rows: ServiceSubCategoryTranslationUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await subTrM({ variables: { rows } });
        return data?.bulkUpsertServiceSubCategoryTranslations;
      }, notify),
    removeServiceSubCategory: (id: number) =>
      runDelete(() => delSubM({ variables: { id } })),
    removeServiceSubCategoryTranslation: (id: number) =>
      runDelete(() => delSubTrM({ variables: { id } })),
  };
}
