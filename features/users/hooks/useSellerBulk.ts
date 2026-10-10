"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { RAW_SELLERS } from "@/graphql/sellers/queries";
import {
  BULK_UPSERT_BUSINESS_PROFILES,
  BULK_UPSERT_PERSON_PROFILES,
  BULK_UPSERT_SELLER_PREFERENCES,
  BULK_UPSERT_SELLERS,
} from "@/graphql/sellers/mutations";
import type { BulkResult } from "@/components/BulkImportDialog/BulkImportDialog";
import type {
  BusinessProfileUpsertRow,
  PersonProfileUpsertRow,
  RawSeller,
  SellerPreferencesUpsertRow,
  SellerUpsertRow,
} from "../xlsx";

const EXPORT_PAGE_SIZE = 500;
/** Rows per mutation, so a full backup never makes one huge request. */
const IMPORT_CHUNK = 200;

type RawSellersPage = {
  rawSellers: { nodes: RawSeller[]; pageInfo: { hasNextPage: boolean } };
};

/**
 * Export (every page, or just the selected ids) and the four sheet imports of
 * the sellers workbook. Each import sends the rows in chunks and merges the
 * results, shifting row indexes back to the sheet's own numbering. Resolves to
 * null when a request fails outright.
 */
export function useSellerBulk() {
  const client = useApolloClient();
  const [sellersM] = useMutation<Record<string, BulkResult>>(BULK_UPSERT_SELLERS);
  const [personsM] = useMutation<Record<string, BulkResult>>(BULK_UPSERT_PERSON_PROFILES);
  const [businessesM] = useMutation<Record<string, BulkResult>>(
    BULK_UPSERT_BUSINESS_PROFILES,
  );
  const [preferencesM] = useMutation<Record<string, BulkResult>>(
    BULK_UPSERT_SELLER_PREFERENCES,
  );

  const fetchRaw = async (ids?: string[]): Promise<RawSeller[]> => {
    const all: RawSeller[] = [];
    for (let page = 1; page < 1000; page += 1) {
      const result = await client.query<RawSellersPage>({
        query: RAW_SELLERS,
        variables: { page, pageSize: EXPORT_PAGE_SIZE, ids: ids?.length ? ids : null },
        fetchPolicy: "network-only",
      });
      const conn = result.data?.rawSellers;
      if (!conn) break;
      all.push(...conn.nodes);
      if (!conn.pageInfo.hasNextPage) break;
    }
    return all;
  };

  const inChunks =
    <T>(
      mutate: (options: { variables: { rows: T[] } }) => Promise<{
        data?: Record<string, BulkResult> | null;
      }>,
      field: string,
    ) =>
    async (rows: T[]): Promise<BulkResult | null> => {
      const merged: BulkResult = {
        created: 0,
        createdIds: [],
        updated: 0,
        failed: 0,
        errors: [],
      };
      try {
        for (let start = 0; start < rows.length; start += IMPORT_CHUNK) {
          const { data } = await mutate({
            variables: { rows: rows.slice(start, start + IMPORT_CHUNK) },
          });
          const part = data?.[field];
          if (!part) return null;
          merged.created += part.created;
          merged.updated += part.updated;
          merged.failed += part.failed;
          merged.createdIds.push(...part.createdIds);
          merged.errors.push(
            ...part.errors.map((e) => ({ ...e, index: e.index + start })),
          );
        }
        return merged;
      } catch {
        return null;
      }
    };

  return {
    fetchRaw,
    upsertSellers: inChunks<SellerUpsertRow>(sellersM, "bulkUpsertSellers"),
    upsertPersons: inChunks<PersonProfileUpsertRow>(personsM, "bulkUpsertPersonProfiles"),
    upsertBusinesses: inChunks<BusinessProfileUpsertRow>(
      businessesM,
      "bulkUpsertBusinessProfiles",
    ),
    upsertPreferences: inChunks<SellerPreferencesUpsertRow>(
      preferencesM,
      "bulkUpsertSellerPreferences",
    ),
  };
}
