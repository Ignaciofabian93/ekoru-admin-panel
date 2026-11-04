import type { CatalogKind } from "@/features/businessPublish/catalog";

export type { CatalogKind };

/** Photos per listing, as on the web and in the gateway. */
export const MAX_ITEM_IMAGES = 3;

/** One store product or service, as the catalog screen shows it. */
export type CatalogItem = {
  id: number;
  name: string;
  /** Store product price, or a service's base price (null when quoted). */
  price: number | null;
  stock: number | null;
  quoted: boolean;
  isActive: boolean;
  images: string[];
};

export type CatalogFilter = "all" | "noPhoto" | "hidden";

export const CATALOG_FILTERS: CatalogFilter[] = ["all", "noPhoto", "hidden"];

/** Store products can't be shown without a photo; services can (the web's rule). */
export const needsPhoto = (kind: CatalogKind) => kind === "products";
