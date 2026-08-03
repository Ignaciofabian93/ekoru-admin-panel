"use client";

import { useMutation } from "@apollo/client/react";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import {
  KIND_CONFIG,
  type BulkUpsertResult,
  type SearchKind,
  type SearchUpsertRow,
} from "../types";

/**
 * Writes for one search-config table. `upsert` maps to the backend bulk mutation
 * — a one-row array is a row edit/create, a many-row array is an XLSX import.
 * With `notify` (default) a clean batch toasts success and a batch with row
 * failures toasts the first error; pass `notify: false` when the caller reports
 * results itself (the import dialog).
 */
export function useSearchConfigMutations(kind: SearchKind) {
  const cfg = KIND_CONFIG[kind];
  const toast = useToast();
  const { t } = useTranslation("searchConfig");

  const [upsertM, s1] = useMutation<Record<string, BulkUpsertResult>>(cfg.upsertMutation);
  const [deleteM, d1] = useMutation(cfg.deleteMutation);
  const loading = s1.loading || d1.loading;

  const upsert = async (
    rows: SearchUpsertRow[],
    notify = true,
  ): Promise<BulkUpsertResult | null> => {
    try {
      const { data } = await upsertM({ variables: { rows } });
      const result = data?.[cfg.upsertField] ?? null;
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
