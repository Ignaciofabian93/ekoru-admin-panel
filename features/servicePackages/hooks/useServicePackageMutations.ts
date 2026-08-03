"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_SERVICE_PACKAGES,
  BULK_UPSERT_SERVICE_PACKAGE_ITEMS,
  DELETE_SERVICE_PACKAGE,
  DELETE_SERVICE_PACKAGE_ITEM,
} from "@/graphql/servicePackages/mutations";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type {
  BulkUpsertResult,
  ServicePackageItemUpsertRow,
  ServicePackageUpsertRow,
} from "../types";

/**
 * Writes for ServicePackage + its items. Each bulk mutation backs both the
 * row-edit forms (a one-row array) and the XLSX import (many rows).
 */
export function useServicePackageMutations() {
  const toast = useToast();
  const { t } = useTranslation("servicePackages");

  const [upsertPackagesM, s1] = useMutation<{
    bulkUpsertServicePackages: BulkUpsertResult;
  }>(BULK_UPSERT_SERVICE_PACKAGES);
  const [deletePackageM, s2] = useMutation(DELETE_SERVICE_PACKAGE);
  const [upsertItemsM, s3] = useMutation<{
    bulkUpsertServicePackageItems: BulkUpsertResult;
  }>(BULK_UPSERT_SERVICE_PACKAGE_ITEMS);
  const [deleteItemM, s4] = useMutation(DELETE_SERVICE_PACKAGE_ITEM);

  const loading = s1.loading || s2.loading || s3.loading || s4.loading;

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
    upsertPackages: (rows: ServicePackageUpsertRow[], notify = true) =>
      runBulk(
        (r) => upsertPackagesM({ variables: { rows: r } }),
        "bulkUpsertServicePackages",
        rows,
        notify,
      ),
    removePackage: (id: number) => runDelete(() => deletePackageM({ variables: { id } })),
    upsertItems: (rows: ServicePackageItemUpsertRow[], notify = true) =>
      runBulk(
        (r) => upsertItemsM({ variables: { rows: r } }),
        "bulkUpsertServicePackageItems",
        rows,
        notify,
      ),
    removeItem: (id: number) => runDelete(() => deleteItemM({ variables: { id } })),
  };
}
