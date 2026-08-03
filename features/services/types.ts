/**
 * Types for the services admin feature — the raw admin-only GraphQL surface of
 * ekoru-services (AdminServicesResolver): the whole Service catalog exactly as
 * stored (inactive included), each service carrying its media + FAQ.
 *
 * Service is a flat, single-language table (no translations); metrics and
 * timestamps are read-only. The JSON scheduling columns are not editable here.
 */

export const SERVICE_PRICING = ["FIXED", "HOURLY", "QUOTATION", "PACKAGE"] as const;
export type ServicePricing = (typeof SERVICE_PRICING)[number];

export type RawCatalogPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

export type ServiceMedia = {
  id: number;
  serviceId: number;
  mediaType: string;
  url: string;
  title: string | null;
  description: string | null;
  displayOrder: number;
  isPortfolio: boolean;
  isCertificate: boolean;
};

export type ServiceFaq = {
  id: number;
  serviceId: number | null;
  subcategoryId: number | null;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
};

export type RawService = {
  id: number;
  name: string;
  description: string | null;
  sellerId: string;
  pricingType: ServicePricing;
  basePrice: number | null;
  priceRange: string | null;
  duration: number | null;
  isActive: boolean;
  images: string[];
  tags: string[];
  subcategoryId: number;
  maxConcurrentBookings: number | null;
  advanceBookingDays: number | null;
  serviceRadius: number | null;
  isRemoteService: boolean | null;
  isCurrentlyAvailable: boolean | null;
  averageRating: number | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  serviceMedia: ServiceMedia[];
  serviceFAQ: ServiceFaq[];
};

export type ServiceUpsertRow = {
  id?: number;
  name?: string;
  description?: string | null;
  sellerId?: string;
  pricingType?: ServicePricing;
  basePrice?: number | null;
  priceRange?: string | null;
  duration?: number | null;
  isActive?: boolean;
  images?: string[];
  tags?: string[];
  subcategoryId?: number;
  maxConcurrentBookings?: number | null;
  advanceBookingDays?: number | null;
  serviceRadius?: number | null;
  isRemoteService?: boolean | null;
  isCurrentlyAvailable?: boolean | null;
};

export type ServiceMediaUpsertRow = {
  id?: number;
  serviceId?: number;
  mediaType?: string;
  url?: string;
  title?: string | null;
  description?: string | null;
  displayOrder?: number;
  isPortfolio?: boolean;
  isCertificate?: boolean;
};

export type ServiceFaqUpsertRow = {
  id?: number;
  serviceId?: number | null;
  subcategoryId?: number | null;
  question?: string;
  answer?: string;
  displayOrder?: number;
  isActive?: boolean;
};

export type BulkRowError = {
  index: number;
  id: number | null;
  message: string;
};

export type BulkUpsertResult = {
  created: number;
  createdIds: number[];
  updated: number;
  failed: number;
  errors: BulkRowError[];
};
