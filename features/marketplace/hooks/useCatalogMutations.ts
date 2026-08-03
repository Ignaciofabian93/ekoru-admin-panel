"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_DEPARTMENTS,
  BULK_UPSERT_DEPARTMENT_TRANSLATIONS,
  BULK_UPSERT_DEPARTMENT_CATEGORIES,
  BULK_UPSERT_DEPARTMENT_CATEGORY_TRANSLATIONS,
  BULK_UPSERT_PRODUCT_CATEGORIES,
  BULK_UPSERT_PRODUCT_CATEGORY_TRANSLATIONS,
  BULK_UPSERT_PRODUCT_CATEGORY_MATERIALS,
  DELETE_DEPARTMENT,
  DELETE_DEPARTMENT_TRANSLATION,
  DELETE_DEPARTMENT_CATEGORY,
  DELETE_DEPARTMENT_CATEGORY_TRANSLATION,
  DELETE_PRODUCT_CATEGORY,
  DELETE_PRODUCT_CATEGORY_TRANSLATION,
  DELETE_PRODUCT_CATEGORY_MATERIAL,
} from "@/graphql/marketplace/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type {
  BulkUpsertResult,
  DepartmentUpsertRow,
  DepartmentTranslationUpsertRow,
  DepartmentCategoryUpsertRow,
  DepartmentCategoryTranslationUpsertRow,
  ProductCategoryUpsertRow,
  ProductCategoryTranslationUpsertRow,
  ProductCategoryMaterialUpsertRow,
} from "../types";

/**
 * Writes for the marketplace catalog tables. Each `upsert*` maps to a backend
 * bulk mutation: a one-row array is a row edit / create, a many-row array is
 * an XLSX import. With `notify` (default) a fully successful batch toasts
 * success and a batch with row failures toasts the first row error; pass
 * `notify: false` when the caller reports results itself (the import dialog).
 */
export function useCatalogMutations() {
  const toast = useToast();
  const { t } = useTranslation("marketplace");

  const [departmentsM, s1] = useMutation<{
    bulkUpsertDepartments: BulkUpsertResult;
  }>(BULK_UPSERT_DEPARTMENTS);
  const [departmentTranslationsM, s2] = useMutation<{
    bulkUpsertDepartmentTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_DEPARTMENT_TRANSLATIONS);
  const [departmentCategoriesM, s3] = useMutation<{
    bulkUpsertDepartmentCategories: BulkUpsertResult;
  }>(BULK_UPSERT_DEPARTMENT_CATEGORIES);
  const [departmentCategoryTranslationsM, s4] = useMutation<{
    bulkUpsertDepartmentCategoryTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_DEPARTMENT_CATEGORY_TRANSLATIONS);
  const [productCategoriesM, s5] = useMutation<{
    bulkUpsertProductCategories: BulkUpsertResult;
  }>(BULK_UPSERT_PRODUCT_CATEGORIES);
  const [productCategoryTranslationsM, s6] = useMutation<{
    bulkUpsertProductCategoryTranslations: BulkUpsertResult;
  }>(BULK_UPSERT_PRODUCT_CATEGORY_TRANSLATIONS);
  const [productCategoryMaterialsM, s7] = useMutation<{
    bulkUpsertProductCategoryMaterials: BulkUpsertResult;
  }>(BULK_UPSERT_PRODUCT_CATEGORY_MATERIALS);

  const [deleteDepartmentM, d1] = useMutation(DELETE_DEPARTMENT);
  const [deleteDepartmentTranslationM, d2] = useMutation(DELETE_DEPARTMENT_TRANSLATION);
  const [deleteDepartmentCategoryM, d3] = useMutation(DELETE_DEPARTMENT_CATEGORY);
  const [deleteDepartmentCategoryTranslationM, d4] = useMutation(
    DELETE_DEPARTMENT_CATEGORY_TRANSLATION,
  );
  const [deleteProductCategoryM, d5] = useMutation(DELETE_PRODUCT_CATEGORY);
  const [deleteProductCategoryTranslationM, d6] = useMutation(
    DELETE_PRODUCT_CATEGORY_TRANSLATION,
  );
  const [deleteProductCategoryMaterialM, d7] = useMutation(
    DELETE_PRODUCT_CATEGORY_MATERIAL,
  );

  const loading =
    s1.loading ||
    s2.loading ||
    s3.loading ||
    s4.loading ||
    s5.loading ||
    s6.loading ||
    s7.loading ||
    d1.loading ||
    d2.loading ||
    d3.loading ||
    d4.loading ||
    d5.loading ||
    d6.loading ||
    d7.loading;

  /** Toasts the outcome of a bulk result (skipped with notify=false). */
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

    upsertDepartments: (rows: DepartmentUpsertRow[], notify = true) =>
      runBulk(async () => {
        const { data } = await departmentsM({ variables: { rows } });
        return data?.bulkUpsertDepartments;
      }, notify),

    upsertDepartmentTranslations: (
      rows: DepartmentTranslationUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await departmentTranslationsM({ variables: { rows } });
        return data?.bulkUpsertDepartmentTranslations;
      }, notify),

    upsertDepartmentCategories: (rows: DepartmentCategoryUpsertRow[], notify = true) =>
      runBulk(async () => {
        const { data } = await departmentCategoriesM({ variables: { rows } });
        return data?.bulkUpsertDepartmentCategories;
      }, notify),

    upsertDepartmentCategoryTranslations: (
      rows: DepartmentCategoryTranslationUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await departmentCategoryTranslationsM({
          variables: { rows },
        });
        return data?.bulkUpsertDepartmentCategoryTranslations;
      }, notify),

    upsertProductCategories: (rows: ProductCategoryUpsertRow[], notify = true) =>
      runBulk(async () => {
        const { data } = await productCategoriesM({ variables: { rows } });
        return data?.bulkUpsertProductCategories;
      }, notify),

    upsertProductCategoryTranslations: (
      rows: ProductCategoryTranslationUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await productCategoryTranslationsM({
          variables: { rows },
        });
        return data?.bulkUpsertProductCategoryTranslations;
      }, notify),

    upsertProductCategoryMaterials: (
      rows: ProductCategoryMaterialUpsertRow[],
      notify = true,
    ) =>
      runBulk(async () => {
        const { data } = await productCategoryMaterialsM({ variables: { rows } });
        return data?.bulkUpsertProductCategoryMaterials;
      }, notify),

    removeDepartment: (id: number) =>
      runDelete(() => deleteDepartmentM({ variables: { id } })),
    removeDepartmentTranslation: (id: number) =>
      runDelete(() => deleteDepartmentTranslationM({ variables: { id } })),
    removeDepartmentCategory: (id: number) =>
      runDelete(() => deleteDepartmentCategoryM({ variables: { id } })),
    removeDepartmentCategoryTranslation: (id: number) =>
      runDelete(() => deleteDepartmentCategoryTranslationM({ variables: { id } })),
    removeProductCategory: (id: number) =>
      runDelete(() => deleteProductCategoryM({ variables: { id } })),
    removeProductCategoryTranslation: (id: number) =>
      runDelete(() => deleteProductCategoryTranslationM({ variables: { id } })),
    removeProductCategoryMaterial: (id: number) =>
      runDelete(() => deleteProductCategoryMaterialM({ variables: { id } })),
  };
}
