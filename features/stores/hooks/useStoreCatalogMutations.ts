"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_STORE_CATEGORIES,
  BULK_UPSERT_STORE_CATEGORY_TRANSLATIONS,
  BULK_UPSERT_STORE_SUB_CATEGORIES,
  BULK_UPSERT_STORE_SUB_CATEGORY_TRANSLATIONS,
  DELETE_STORE_CATEGORY,
  DELETE_STORE_CATEGORY_TRANSLATION,
  DELETE_STORE_SUB_CATEGORY,
  DELETE_STORE_SUB_CATEGORY_TRANSLATION,
} from "@/graphql/stores/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type {
  BulkUpsertResult,
  StoreCategoryUpsertRow,
  StoreCategoryTranslationUpsertRow,
  StoreSubCategoryUpsertRow,
  StoreSubCategoryTranslationUpsertRow,
} from "../types";

/**
 * Writes for the store catalog tables. Each `upsert*` maps to a backend bulk
 * mutation: a one-row array is a row edit / create, a many-row array is an XLSX
 * import. With `notify` (default) a fully successful batch toasts success and a
 * batch with row failures toasts the first row error; pass `notify: false` when
 * the caller reports results itself (the import dialog).
 */
export function useStoreCatalogMutations() {
  const toast = useToast();
  const { t } = useTranslation("stores");

  const [categoriesM, s1] = useMutation<{
    bulkUpsertStoreCategories: BulkUpsertResult;
  }>(BULK_UPSERT_STORE_CATEGORIES);
  const [categoryTranslationsM, s2] = useMutation<{
    bulkUpsertStoreCategoryTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_STORE_CATEGORY_TRANSLATIONS);
  const [subCategoriesM, s3] = useMutation<{
    bulkUpsertStoreSubCategories: BulkUpsertResult;
  }>(BULK_UPSERT_STORE_SUB_CATEGORIES);
  const [subCategoryTranslationsM, s4] = useMutation<{
    bulkUpsertStoreSubCategoryTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_STORE_SUB_CATEGORY_TRANSLATIONS);

  const [deleteCategoryM, d1] = useMutation(DELETE_STORE_CATEGORY);
  const [deleteCategoryTranslationM, d2] = useMutation(DELETE_STORE_CATEGORY_TRANSLATION);
  const [deleteSubCategoryM, d3] = useMutation(DELETE_STORE_SUB_CATEGORY);
  const [deleteSubCategoryTranslationM, d4] = useMutation(
    DELETE_STORE_SUB_CATEGORY_TRANSLATION,
  );

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

    upsertStoreCategories: (rows: StoreCategoryUpsertRow[], notify = true) =>
      runBulk(async () => {
        const { data } = await categoriesM({ variables: { rows } });
        return data?.bulkUpsertStoreCategories;
      }, notify),

    upsertStoreCategoryTranslations: (
      rows: StoreCategoryTranslationUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await categoryTranslationsM({ variables: { rows } });
        return data?.bulkUpsertStoreCategoryTranslations;
      }, notify),

    upsertStoreSubCategories: (rows: StoreSubCategoryUpsertRow[], notify = true) =>
      runBulk(async () => {
        const { data } = await subCategoriesM({ variables: { rows } });
        return data?.bulkUpsertStoreSubCategories;
      }, notify),

    upsertStoreSubCategoryTranslations: (
      rows: StoreSubCategoryTranslationUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await subCategoryTranslationsM({ variables: { rows } });
        return data?.bulkUpsertStoreSubCategoryTranslations;
      }, notify),

    removeStoreCategory: (id: number) =>
      runDelete(() => deleteCategoryM({ variables: { id } })),
    removeStoreCategoryTranslation: (id: number) =>
      runDelete(() => deleteCategoryTranslationM({ variables: { id } })),
    removeStoreSubCategory: (id: number) =>
      runDelete(() => deleteSubCategoryM({ variables: { id } })),
    removeStoreSubCategoryTranslation: (id: number) =>
      runDelete(() => deleteSubCategoryTranslationM({ variables: { id } })),
  };
}
