"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_PAYMENT_CONFIGS,
  DELETE_PAYMENT_CONFIG,
} from "@/graphql/paymentConfigs/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { BulkUpsertResult, PaymentConfigUpsertRow } from "../types";

/**
 * Writes for ChileanPaymentConfig. The bulk mutation backs both the row-edit
 * form (a one-row array) and the XLSX import (many rows). apiKey/secretKey are
 * write-only — sent only when the caller fills them.
 */
export function usePaymentConfigMutations() {
  const toast = useToast();
  const { t } = useTranslation("paymentConfigs");

  const [upsertM, s1] = useMutation<{
    bulkUpsertChileanPaymentConfigs: BulkUpsertResult;
  }>(BULK_UPSERT_PAYMENT_CONFIGS);
  const [deleteM, d1] = useMutation(DELETE_PAYMENT_CONFIG);
  const loading = s1.loading || d1.loading;

  const upsert = async (
    rows: PaymentConfigUpsertRow[],
    notify = true,
  ): Promise<BulkUpsertResult | null> => {
    try {
      const { data } = await upsertM({ variables: { rows } });
      const result = data?.bulkUpsertChileanPaymentConfigs ?? null;
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

  const remove = async (id: string | number): Promise<boolean> => {
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
