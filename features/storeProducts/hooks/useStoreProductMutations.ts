"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_STORE_PRODUCTS,
  DELETE_STORE_PRODUCT,
} from "@/graphql/storeProducts/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { BulkUpsertResult, StoreProductUpsertRow } from "../types";

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

  const loading = s1.loading || d1.loading;

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

  const removeStoreProduct = async (id: number): Promise<boolean> => {
    try {
      await deleteM({ variables: { id } });
      toast.success(t("feedback.deleted"));
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      toast.error(message || t("feedback.error"));
      return false;
    }
  };

  return { loading, upsertStoreProducts, removeStoreProduct };
}
