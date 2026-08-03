"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_ADVERTISEMENTS,
  DELETE_ADVERTISEMENT,
} from "@/graphql/advertisements/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { AdvertisementUpsertRow, BulkUpsertResult } from "../types";

/**
 * Writes for Advertisement. `upsert` maps to the backend bulk mutation: a
 * one-row array is a row edit / create, a many-row array is an XLSX import.
 */
export function useAdvertisementMutations() {
  const toast = useToast();
  const { t } = useTranslation("advertisements");

  const [upsertM, s1] = useMutation<{
    bulkUpsertAdvertisements: BulkUpsertResult;
  }>(BULK_UPSERT_ADVERTISEMENTS);
  const [deleteM, d1] = useMutation(DELETE_ADVERTISEMENT);
  const loading = s1.loading || d1.loading;

  const upsert = async (
    rows: AdvertisementUpsertRow[],
    notify = true,
  ): Promise<BulkUpsertResult | null> => {
    try {
      const { data } = await upsertM({ variables: { rows } });
      const result = data?.bulkUpsertAdvertisements ?? null;
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

  const remove = async (id: number): Promise<boolean> => {
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

  return { loading, upsert, remove };
}
