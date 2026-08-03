"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_STORE_PRODUCTS,
  BULK_UPSERT_STORE_PRODUCT_MATERIALS,
  BULK_UPSERT_PRODUCT_VARIANTS,
  DELETE_STORE_PRODUCT,
  DELETE_STORE_PRODUCT_MATERIAL,
  DELETE_PRODUCT_VARIANT,
} from "@/graphql/storeProducts/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type {
  BulkUpsertResult,
  ProductVariantUpsertRow,
  StoreProductMaterialUpsertRow,
  StoreProductUpsertRow,
} from "../types";

/**
 * Writes for StoreProduct. `upsertStoreProducts` maps to the backend bulk
 * mutation: a one-row array is a row edit / create, a many-row array is an XLSX
 * import. With `notify` (default) a fully successful batch toasts success and a
 * batch with row failures toasts the first row error; pass `notify: false` when
 * the caller reports results itself (the import dialog).
 */
export function useStoreProductMutations() {
  const toast = useToast();
  const { t } = useTranslation("storeProducts");

  const [upsertM, s1] = useMutation<{
    bulkUpsertStoreProducts: BulkUpsertResult;
  }>(BULK_UPSERT_STORE_PRODUCTS);
  const [deleteM, d1] = useMutation(DELETE_STORE_PRODUCT);
  const [upsertMaterialsM, s2] = useMutation<{
    bulkUpsertStoreProductMaterials: BulkUpsertResult;
  }>(BULK_UPSERT_STORE_PRODUCT_MATERIALS);
  const [deleteMaterialM, d2] = useMutation(DELETE_STORE_PRODUCT_MATERIAL);
  const [upsertVariantsM, s3] = useMutation<{
    bulkUpsertProductVariants: BulkUpsertResult;
  }>(BULK_UPSERT_PRODUCT_VARIANTS);
  const [deleteVariantM, d3] = useMutation(DELETE_PRODUCT_VARIANT);

  const loading =
    s1.loading || d1.loading || s2.loading || d2.loading || s3.loading || d3.loading;

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

  const upsertStoreProducts = async (
    rows: StoreProductUpsertRow[],
    notify = true,
  ): Promise<BulkUpsertResult | null> => {
    try {
      const { data } = await upsertM({ variables: { rows } });
      return reportBulk(data?.bulkUpsertStoreProducts, notify);
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

  const removeStoreProduct = (id: number) =>
    runDelete(() => deleteM({ variables: { id } }));

  const upsertMaterials = async (
    rows: StoreProductMaterialUpsertRow[],
    notify = true,
  ): Promise<BulkUpsertResult | null> => {
    try {
      const { data } = await upsertMaterialsM({ variables: { rows } });
      return reportBulk(data?.bulkUpsertStoreProductMaterials, notify);
    } catch (error) {
      if (notify) {
        const message = error instanceof Error ? error.message : "";
        toast.error(message || t("feedback.error"));
      }
      return null;
    }
  };

  const upsertVariants = async (
    rows: ProductVariantUpsertRow[],
    notify = true,
  ): Promise<BulkUpsertResult | null> => {
    try {
      const { data } = await upsertVariantsM({ variables: { rows } });
      return reportBulk(data?.bulkUpsertProductVariants, notify);
    } catch (error) {
      if (notify) {
        const message = error instanceof Error ? error.message : "";
        toast.error(message || t("feedback.error"));
      }
      return null;
    }
  };

  const removeMaterial = (id: number) =>
    runDelete(() => deleteMaterialM({ variables: { id } }));
  const removeVariant = (id: number) =>
    runDelete(() => deleteVariantM({ variables: { id } }));

  return {
    loading,
    upsertStoreProducts,
    removeStoreProduct,
    upsertMaterials,
    removeMaterial,
    upsertVariants,
    removeVariant,
  };
}
