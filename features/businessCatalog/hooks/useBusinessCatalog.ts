"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useApolloClient } from "@apollo/client/react";
import {
  CATALOG_SERVICES,
  CATALOG_STORE_PRODUCTS,
} from "@/graphql/businessCatalog/queries";
import {
  PUBLISH_MY_SERVICES,
  PUBLISH_MY_STORE_PRODUCTS,
} from "@/graphql/businessPublish/mutations";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import api from "@/lib/api/client";
import { ImageRefusedError, prepareImage } from "@/utils/prepareImage";
import { NAMESPACE } from "../i18n";
import { MAX_ITEM_IMAGES, type CatalogItem, type CatalogKind } from "../types";

type Node = Record<string, unknown>;
type Page = { nodes: Node[]; pageInfo: { hasNextPage: boolean } };
type BulkResult = { errors: { message: string }[] };
type PhotoAnswer = { images: string[]; isActive: boolean };

/** The raw reads answer at most this many rows per page. */
const PAGE_SIZE = 200;

/** The gateway's and the picked file's refusals, worded under `errors`. */
const REFUSALS = new Set([
  "PANEL_FORBIDDEN",
  "ITEM_NOT_FOUND",
  "TOO_MANY_IMAGES",
  "IMAGE_NOT_LISTED",
  "IMAGE_FORMAT",
  "IMAGE_TOO_HEAVY",
  "IMAGE_TOO_LARGE",
  "IMAGE_UNREADABLE",
]);

const toItem = (kind: CatalogKind, node: Node): CatalogItem => ({
  id: Number(node.id),
  name: String(node.name ?? ""),
  price: ((kind === "products" ? node.price : node.basePrice) as number | null) ?? null,
  stock: kind === "products" ? ((node.stock as number | null) ?? null) : null,
  quoted: kind === "services" && node.pricingType === "QUOTATION",
  isActive: Boolean(node.isActive),
  images: (node.images as string[] | null) ?? [],
});

/**
 * One catalog's listings for Catálogo y fotos (ADM-16): every store product
 * or service the business has, loaded whole so the filters and the search
 * work across all of them, with its photos and whether EKORU shows it.
 *
 * Photos go through the panel's `/api/images/business` route to the gateway,
 * which checks the account, the plan and that the listing is the business's.
 * Visibility goes through the spreadsheet mutations, which keep the web's
 * rule that a store product needs a photo to be shown.
 */
export function useBusinessCatalog(kind: CatalogKind) {
  const client = useApolloClient();
  const toast = useToast();
  const language = useGqlLanguage();
  const { t } = useTranslation(NAMESPACE);

  const [items, setItems] = useState<CatalogItem[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  // The listing being changed, so its buttons wait.
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const query = kind === "products" ? CATALOG_STORE_PRODUCTS : CATALOG_SERVICES;
    const field = kind === "products" ? "rawStoreProducts" : "rawServices";
    const load = async () => {
      const rows: CatalogItem[] = [];
      try {
        for (let page = 1; ; page++) {
          const { data } = await client.query<Record<string, Page>>({
            query,
            variables: { page, pageSize: PAGE_SIZE },
            fetchPolicy: "network-only",
          });
          const result = data?.[field];
          rows.push(...(result?.nodes ?? []).map((node) => toItem(kind, node)));
          if (!result?.pageInfo.hasNextPage) break;
        }
        if (!cancelled) setItems(rows);
      } catch {
        if (!cancelled) setLoadFailed(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [client, kind]);

  const patch = (id: number, change: Partial<CatalogItem>) =>
    setItems(
      (current) =>
        current?.map((item) => (item.id === id ? { ...item, ...change } : item)) ?? null,
    );

  /**
   * The gateway's refusal or the picked file's, in the admin's language. A
   * subgraph's refusal (a GraphQL error) already comes in it.
   */
  const problem = (error: unknown): string => {
    const max = String(MAX_ITEM_IMAGES);
    if (error instanceof ImageRefusedError) return t(`errors.${error.code}`, { max });
    if (isAxiosError(error)) {
      const code = (error.response?.data as { code?: unknown } | undefined)?.code;
      return typeof code === "string" && REFUSALS.has(code)
        ? t(`errors.${code}`, { max })
        : t("feedback.error");
    }
    return error instanceof Error && error.message ? error.message : t("feedback.error");
  };

  const run = async (id: number, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
    } catch (error) {
      toast.error(problem(error));
    } finally {
      setBusyId(null);
    }
  };

  const itemType = kind === "products" ? "storeProduct" : "service";

  /** Adds the picked photos one by one, up to the listing's free slots. */
  const addPhotos = (item: CatalogItem, files: File[]) =>
    run(item.id, async () => {
      const room = MAX_ITEM_IMAGES - item.images.length;
      if (files.length > room) {
        toast.error(t("errors.TOO_MANY_IMAGES", { max: String(MAX_ITEM_IMAGES) }));
      }
      for (const file of files.slice(0, Math.max(0, room))) {
        const body = new FormData();
        body.append("image", await prepareImage(file));
        body.append("itemType", itemType);
        body.append("itemId", String(item.id));
        const { data } = await api.post<PhotoAnswer>("/images/business", body);
        patch(item.id, data);
      }
      toast.success(t("feedback.photoAdded"));
    });

  const photoAction = (item: CatalogItem, action: "remove" | "cover", key: string) =>
    run(item.id, async () => {
      const { data } = await api.post<PhotoAnswer>("/images/business", {
        action,
        itemType,
        itemId: item.id,
        key,
      });
      patch(item.id, data);
      if (action === "remove") toast.success(t("feedback.photoRemoved"));
    });

  /** Shows the listing on EKORU or hides it. */
  const setVisible = (item: CatalogItem, isActive: boolean) =>
    run(item.id, async () => {
      const mutation =
        kind === "products" ? PUBLISH_MY_STORE_PRODUCTS : PUBLISH_MY_SERVICES;
      const field = kind === "products" ? "publishMyStoreProducts" : "publishMyServices";
      const { data } = await client.mutate<Record<string, BulkResult>>({
        mutation,
        variables: { rows: [{ id: item.id, isActive }], language },
      });
      const refusal = data?.[field]?.errors[0]?.message;
      if (refusal) throw new Error(refusal);
      patch(item.id, { isActive });
      toast.success(t(isActive ? "feedback.shown" : "feedback.hidden"));
    });

  return {
    items,
    loading: items === null && !loadFailed,
    loadFailed,
    busyId,
    addPhotos,
    removePhoto: (item: CatalogItem, key: string) => photoAction(item, "remove", key),
    setCover: (item: CatalogItem, key: string) => photoAction(item, "cover", key),
    setVisible,
  };
}
