"use client";

import { useMutation } from "@apollo/client/react";
import {
  BULK_UPSERT_SELLER_LEVELS,
  BULK_UPSERT_SELLER_LEVEL_TRANSLATIONS,
} from "@/graphql/seller-levels/mutations";
import type { BulkResult } from "@/components/BulkImportDialog/BulkImportDialog";
import type { SellerLevelUpsertRow, SellerLevelTranslationUpsertRow } from "../xlsx";

/**
 * Bulk create/update seller levels and their translations — the commit side of
 * the XLSX import. Each call resolves to the backend `UsersBulkUpsertResult`
 * (or null on a thrown error) so the import dialog can render per-row outcomes.
 */
export function useSellerLevelBulk() {
  const [upsertLevelsM] = useMutation<{
    bulkUpsertSellerLevels: BulkResult;
  }>(BULK_UPSERT_SELLER_LEVELS);
  const [upsertTranslationsM] = useMutation<{
    bulkUpsertSellerLevelTranslations: BulkResult;
  }>(BULK_UPSERT_SELLER_LEVEL_TRANSLATIONS);

  const upsertData = async (rows: SellerLevelUpsertRow[]): Promise<BulkResult | null> => {
    try {
      const { data } = await upsertLevelsM({ variables: { rows } });
      return data?.bulkUpsertSellerLevels ?? null;
    } catch {
      return null;
    }
  };

  const upsertTranslations = async (
    rows: SellerLevelTranslationUpsertRow[],
  ): Promise<BulkResult | null> => {
    try {
      const { data } = await upsertTranslationsM({ variables: { rows } });
      return data?.bulkUpsertSellerLevelTranslations ?? null;
    } catch {
      return null;
    }
  };

  return { upsertData, upsertTranslations };
}
