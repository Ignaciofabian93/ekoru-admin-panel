"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_SERVICES,
  BULK_UPSERT_SERVICE_FAQS,
  BULK_UPSERT_SERVICE_MEDIA,
  DELETE_SERVICE,
  DELETE_SERVICE_FAQ,
  DELETE_SERVICE_MEDIA,
} from "@/graphql/services/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type {
  BulkUpsertResult,
  ServiceFaqUpsertRow,
  ServiceMediaUpsertRow,
  ServiceUpsertRow,
} from "../types";

/**
 * Writes for Service + its media / FAQ. Each bulk mutation backs both the
 * row-edit forms (a one-row array) and the XLSX import (many rows). With
 * `notify` (default) a clean batch toasts success and a batch with row failures
 * toasts the first error; pass `notify: false` when the caller reports results
 * itself (the import dialog).
 */
export function useServiceMutations() {
  const toast = useToast();
  const { t } = useTranslation("services");

  const [upsertServicesM, s1] = useMutation<{
    bulkUpsertServices: BulkUpsertResult;
  }>(BULK_UPSERT_SERVICES);
  const [deleteServiceM, s2] = useMutation(DELETE_SERVICE);
  const [upsertMediaM, s3] = useMutation<{
    bulkUpsertServiceMedia: BulkUpsertResult;
  }>(BULK_UPSERT_SERVICE_MEDIA);
  const [deleteMediaM, s4] = useMutation(DELETE_SERVICE_MEDIA);
  const [upsertFaqsM, s5] = useMutation<{
    bulkUpsertServiceFaqs: BulkUpsertResult;
  }>(BULK_UPSERT_SERVICE_FAQS);
  const [deleteFaqM, s6] = useMutation(DELETE_SERVICE_FAQ);

  const loading =
    s1.loading || s2.loading || s3.loading || s4.loading || s5.loading || s6.loading;

  const report = (
    result: BulkUpsertResult | null | undefined,
    notify: boolean,
  ): BulkUpsertResult | null => {
    if (!result) {
      if (notify) toast.error(t("feedback.error"));
      return null;
    }
    if (notify) {
      if (result.failed > 0)
        toast.error(
          t("feedback.rowsFailed", {
            count: String(result.failed),
            message: result.errors[0]?.message ?? "",
          }),
        );
      else toast.success(t("feedback.saved"));
    }
    return result;
  };

  const runBulk = async <T>(
    call: (rows: T[]) => Promise<{ data?: Record<string, BulkUpsertResult> | null }>,
    field: string,
    rows: T[],
    notify: boolean,
  ): Promise<BulkUpsertResult | null> => {
    try {
      const { data } = await call(rows);
      return report(data?.[field] ?? null, notify);
    } catch (error) {
      if (notify) {
        const message = error instanceof Error ? error.message : "";
        toast.error(message || t("feedback.error"));
      }
      return null;
    }
  };

  const runDelete = async (call: () => Promise<unknown>): Promise<boolean> => {
    try {
      await call();
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
    upsertServices: (rows: ServiceUpsertRow[], notify = true) =>
      runBulk(
        (r) => upsertServicesM({ variables: { rows: r } }),
        "bulkUpsertServices",
        rows,
        notify,
      ),
    removeService: (id: number) => runDelete(() => deleteServiceM({ variables: { id } })),
    upsertMedia: (rows: ServiceMediaUpsertRow[], notify = true) =>
      runBulk(
        (r) => upsertMediaM({ variables: { rows: r } }),
        "bulkUpsertServiceMedia",
        rows,
        notify,
      ),
    removeMedia: (id: number) => runDelete(() => deleteMediaM({ variables: { id } })),
    upsertFaqs: (rows: ServiceFaqUpsertRow[], notify = true) =>
      runBulk(
        (r) => upsertFaqsM({ variables: { rows: r } }),
        "bulkUpsertServiceFaqs",
        rows,
        notify,
      ),
    removeFaq: (id: number) => runDelete(() => deleteFaqM({ variables: { id } })),
  };
}
