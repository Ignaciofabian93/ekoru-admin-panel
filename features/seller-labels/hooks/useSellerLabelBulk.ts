"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_SELLER_LABELS,
  BULK_UPSERT_SELLER_LABEL_TRANSLATIONS,
} from "@/graphql/seller-labels/mutations";
import type { BulkResult } from "@/components/BulkImportDialog/BulkImportDialog";
import type { SellerLabelUpsertRow, SellerLabelTranslationUpsertRow } from "../xlsx";

/**
 * Bulk create/update seller labels and their translations — the commit side of
 * the XLSX import. Each call resolves to the backend `UsersBulkUpsertResult`
 * (or null on a thrown error) so the import dialog can render per-row outcomes.
 */
export function useSellerLabelBulk() {
  const [upsertLabelsM] = useMutation<{
    bulkUpsertSellerLabels: BulkResult;
  }>(BULK_UPSERT_SELLER_LABELS);
  const [upsertTranslationsM] = useMutation<{
    bulkUpsertSellerLabelTranslations: BulkResult;
  }>(BULK_UPSERT_SELLER_LABEL_TRANSLATIONS);

  const upsertData = async (rows: SellerLabelUpsertRow[]): Promise<BulkResult | null> => {
    try {
      const { data } = await upsertLabelsM({ variables: { rows } });
      return data?.bulkUpsertSellerLabels ?? null;
    } catch {
      return null;
    }
  };

  const upsertTranslations = async (
    rows: SellerLabelTranslationUpsertRow[],
  ): Promise<BulkResult | null> => {
    try {
      const { data } = await upsertTranslationsM({ variables: { rows } });
      return data?.bulkUpsertSellerLabelTranslations ?? null;
    } catch {
      return null;
    }
  };

  return { upsertData, upsertTranslations };
}
