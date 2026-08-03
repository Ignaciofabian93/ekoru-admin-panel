"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_SERVICE_CREDENTIALS,
  DELETE_SERVICE_CREDENTIALS,
} from "@/graphql/providerCredentials/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { BulkUpsertResult, ProviderCredentialsUpsertRow } from "../types";

/**
 * Writes for ServiceProviderCredentials. The bulk mutation backs both the
 * row-edit form (a one-row array) and the XLSX import (many rows).
 */
export function useProviderCredentialMutations() {
  const toast = useToast();
  const { t } = useTranslation("providerCredentials");

  const [upsertM, s1] = useMutation<{
    bulkUpsertServiceCredentials: BulkUpsertResult;
  }>(BULK_UPSERT_SERVICE_CREDENTIALS);
  const [deleteM, d1] = useMutation(DELETE_SERVICE_CREDENTIALS);
  const loading = s1.loading || d1.loading;

  const upsert = async (
    rows: ProviderCredentialsUpsertRow[],
    notify = true,
  ): Promise<BulkUpsertResult | null> => {
    try {
      const { data } = await upsertM({ variables: { rows } });
      const result = data?.bulkUpsertServiceCredentials ?? null;
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
