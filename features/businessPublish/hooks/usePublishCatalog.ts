"use client";

import { useState } from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import {
  PUBLISH_MY_SERVICES,
  PUBLISH_MY_STORE_PRODUCTS,
} from "@/graphql/businessPublish/mutations";
import {
  MATERIAL_REFS,
  MY_SERVICES_EXPORT,
  MY_STORE_PRODUCTS_EXPORT,
  SERVICE_CATALOG_REFS,
  STORE_CATALOG_REFS,
} from "@/graphql/businessPublish/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import type { MaterialRef } from "../cells";
import {
  MAX_ROWS_PER_FILE,
  ROWS_PER_REQUEST,
  cellErrorText,
  downloadWorkbook,
  readWorkbook,
  type CatalogKind,
  type CatalogRefs,
  type ParsedRow,
  type RowOutcome,
} from "../catalog";
import { NAMESPACE } from "../i18n";

type Busy = "template" | "catalog" | "reading" | "publishing" | null;

type BulkResult = {
  created: number;
  createdIds: number[];
  updated: number;
  failed: number;
  errors: { index: number; id: number | null; message: string }[];
};

type Page = { nodes: Record<string, unknown>[]; pageInfo: { hasNextPage: boolean } };

const EXPORT_PAGE_SIZE = 200;

/**
 * One catalog's spreadsheet flow (ADM-16): the template and the current
 * catalog as downloads, then an uploaded file read and checked row by row,
 * published in chunks, and every row's outcome. The server applies the web's
 * rules again; its row errors come back by position and are mapped to the
 * spreadsheet's row numbers.
 */
export function usePublishCatalog(kind: CatalogKind) {
  const client = useApolloClient();
  const toast = useToast();
  const language = useGqlLanguage();
  const { t } = useTranslation(NAMESPACE);

  const catalogRefs = useQuery<{
    getStoreCatalog?: CatalogRefs["categories"];
    getServiceCatalog?: CatalogRefs["categories"];
  }>(kind === "products" ? STORE_CATALOG_REFS : SERVICE_CATALOG_REFS, {
    variables: { language },
  });
  const materialRefs = useQuery<{ materials: MaterialRef[] }>(MATERIAL_REFS, {
    variables: { language },
    skip: kind !== "products",
  });
  const refs: CatalogRefs = {
    categories:
      catalogRefs.data?.getStoreCatalog ?? catalogRefs.data?.getServiceCatalog ?? [],
    materials: materialRefs.data?.materials ?? [],
  };
  const refsLoading = catalogRefs.loading || materialRefs.loading;

  const [busy, setBusy] = useState<Busy>(null);
  const [file, setFile] = useState<{ name: string; rows: ParsedRow[] } | null>(null);
  const [results, setResults] = useState<RowOutcome[] | null>(null);

  const guard = async (state: Busy, action: () => Promise<void>) => {
    setBusy(state);
    try {
      await action();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("feedback.error"));
    } finally {
      setBusy(null);
    }
  };

  const downloadTemplate = () =>
    guard("template", () =>
      downloadWorkbook({ kind, t, refs, fileName: `ekoru-${kind}-template.xlsx` }),
    );

  /** The business's current catalog, with ids, to edit and upload again. */
  const downloadCatalog = () =>
    guard("catalog", async () => {
      const query = kind === "products" ? MY_STORE_PRODUCTS_EXPORT : MY_SERVICES_EXPORT;
      const field = kind === "products" ? "rawStoreProducts" : "rawServices";
      const rows: Record<string, unknown>[] = [];
      for (let page = 1; ; page++) {
        const { data } = await client.query<Record<string, Page>>({
          query,
          variables: { page, pageSize: EXPORT_PAGE_SIZE },
          fetchPolicy: "network-only",
        });
        const result = data?.[field];
        rows.push(...(result?.nodes ?? []));
        if (!result?.pageInfo.hasNextPage) break;
      }
      const date = new Date().toISOString().slice(0, 10);
      await downloadWorkbook({
        kind,
        t,
        refs,
        rows,
        fileName: `ekoru-${kind}-${date}.xlsx`,
      });
    });

  const chooseFile = (picked: File) =>
    guard("reading", async () => {
      setResults(null);
      let rows: ParsedRow[];
      try {
        rows = await readWorkbook({ kind, file: picked, materials: refs.materials });
      } catch {
        throw new Error(t("errors.read"));
      }
      if (rows.length > MAX_ROWS_PER_FILE) {
        throw new Error(
          t("errors.tooMany", {
            count: String(rows.length),
            max: String(MAX_ROWS_PER_FILE),
          }),
        );
      }
      setFile({ name: picked.name, rows });
    });

  const publish = () =>
    guard("publishing", async () => {
      if (!file) return;
      const outcomes: RowOutcome[] = file.rows
        .filter((row) => row.errors.length > 0)
        .map((row) => ({
          rowNumber: row.rowNumber,
          name: row.name,
          outcome: "error",
          message: row.errors.map((e) => cellErrorText(t, kind, e)).join(" · "),
        }));

      const ready = file.rows.filter((row) => row.errors.length === 0);
      const mutation =
        kind === "products" ? PUBLISH_MY_STORE_PRODUCTS : PUBLISH_MY_SERVICES;
      const field = kind === "products" ? "publishMyStoreProducts" : "publishMyServices";

      for (let start = 0; start < ready.length; start += ROWS_PER_REQUEST) {
        const chunk = ready.slice(start, start + ROWS_PER_REQUEST);
        try {
          const { data } = await client.mutate<Record<string, BulkResult>>({
            mutation,
            variables: { rows: chunk.map((row) => row.values), language },
          });
          const result = data?.[field];
          const errorAt = new Map(result?.errors.map((e) => [e.index, e.message]) ?? []);
          const createdIds = [...(result?.createdIds ?? [])];
          chunk.forEach((row, i) => {
            const base = { rowNumber: row.rowNumber, name: row.name };
            const message = errorAt.get(i);
            if (message !== undefined) {
              outcomes.push({ ...base, outcome: "error", message });
            } else if (row.values.id !== undefined) {
              outcomes.push({ ...base, outcome: "updated", id: row.values.id as number });
            } else {
              // Store products without a photo are saved unpublished.
              const images = row.values.images as string[] | undefined;
              const hidden = kind === "products" && !images?.length;
              outcomes.push({
                ...base,
                outcome: hidden ? "hidden" : "created",
                id: createdIds.shift(),
              });
            }
          });
        } catch (error) {
          // The whole chunk was refused, e.g. a business that cannot publish.
          const message = t("errors.request", {
            message: error instanceof Error ? error.message : "",
          });
          chunk.forEach((row) =>
            outcomes.push({
              rowNumber: row.rowNumber,
              name: row.name,
              outcome: "error",
              message,
            }),
          );
        }
      }

      outcomes.sort((a, b) => a.rowNumber - b.rowNumber);
      setResults(outcomes);
      setFile(null);
    });

  const reset = () => {
    setFile(null);
    setResults(null);
  };

  return {
    refsLoading,
    busy,
    file,
    results,
    downloadTemplate,
    downloadCatalog,
    chooseFile,
    publish,
    reset,
  };
}
