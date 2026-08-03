/**
 * Types for the advertisements admin feature — the raw admin surface of
 * ekoru-marketplace (AdminAdsResolver): every Advertisement exactly as stored
 * (inactive included). Flat record with dates, an enum type and optional ids
 * pointing at the promoted item in other subgraphs.
 */

export const ADVERTISEMENT_TYPES = [
  "HERO_BANNER",
  "CATEGORY_HIGHLIGHT",
  "PRODUCT_HIGHLIGHT",
  "FEED_AD_BANNER",
  "NEWSLETTER_SPOTLIGHT",
  "PROMOTIONAL_SEARCH",
  "SOCIAL_MEDIA_SPOTLIGHT",
  "MONTHLY_PACKAGE",
] as const;
export type AdvertisementType = (typeof ADVERTISEMENT_TYPES)[number];

export type RawCatalogPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

export type RawAdvertisement = {
  id: number;
  adType: AdvertisementType;
  price: number;
  content: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sellerId: string;
  productId: number | null;
  storeProductId: number | null;
  serviceId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AdvertisementUpsertRow = {
  id?: number;
  adType?: AdvertisementType;
  price?: number;
  content?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  sellerId?: string;
  productId?: number | null;
  storeProductId?: number | null;
  serviceId?: number | null;
};

export type BulkRowError = { index: number; id: number | null; message: string };

export type BulkUpsertResult = {
  created: number;
  createdIds: number[];
  updated: number;
  failed: number;
  errors: BulkRowError[];
};
