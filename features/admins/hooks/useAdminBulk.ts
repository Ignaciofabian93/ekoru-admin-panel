"use client";

import { useApolloClient, useMutation } from "@apollo/client/react";
import { LIST_ADMINS } from "@/graphql/admins/queries";
import { BULK_UPSERT_ADMINS } from "@/graphql/admins/mutations";
import type { BulkResult } from "@/components/BulkImportDialog/BulkImportDialog";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import type { Admin } from "@/types/admin";
import type { AdminUpsertRow } from "../xlsx";

const EXPORT_PAGE_SIZE = 200;

type AdminsPage = {
  getAdmins: { nodes: Admin[]; pageInfo: { hasNextPage: boolean } };
};

/**
 * Export (walk every page) + bulk import for admins. `upsert` resolves to the
 * backend `UsersBulkUpsertResult` (or null on a thrown error) for the dialog.
 */
export function useAdminBulk() {
  const client = useApolloClient();
  const language = useGqlLanguage();
  const [upsertM] = useMutation<{ bulkUpsertAdmins: BulkResult }>(BULK_UPSERT_ADMINS);

  const fetchAll = async (): Promise<Admin[]> => {
    const all: Admin[] = [];
    for (let page = 1; page < 1000; page += 1) {
      const result = await client.query<AdminsPage>({
        query: LIST_ADMINS,
        variables: { language, page, pageSize: EXPORT_PAGE_SIZE },
        fetchPolicy: "network-only",
      });
      const conn = result.data?.getAdmins;
      if (!conn) break;
      all.push(...conn.nodes);
      if (!conn.pageInfo.hasNextPage) break;
    }
    return all;
  };

  const upsert = async (rows: AdminUpsertRow[]): Promise<BulkResult | null> => {
    try {
      const { data } = await upsertM({ variables: { rows } });
      return data?.bulkUpsertAdmins ?? null;
    } catch {
      return null;
    }
  };

  return { fetchAll, upsert };
}
