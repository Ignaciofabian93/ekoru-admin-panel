/**
 * Types for the service-packages admin feature — the raw admin surface of
 * ekoru-services (AdminServicesResolver): every ServicePackage exactly as
 * stored (inactive included), each carrying its items.
 */

export type RawCatalogPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

export type ServicePackageItem = {
  id: number;
  packageId: number;
  serviceId: number;
  quantity: number;
};

export type RawServicePackage = {
  id: number;
  sellerId: string;
  name: string;
  description: string;
  totalPrice: number;
  discountPercentage: number | null;
  validityDays: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  servicePackageItem: ServicePackageItem[];
};

export type ServicePackageUpsertRow = {
  id?: number;
  sellerId?: string;
  name?: string;
  description?: string;
  totalPrice?: number;
  discountPercentage?: number | null;
  validityDays?: number | null;
  isActive?: boolean;
};

export type ServicePackageItemUpsertRow = {
  id?: number;
  packageId?: number;
  serviceId?: number;
  quantity?: number;
};

export type BulkRowError = { index: number; id: number | null; message: string };

export type BulkUpsertResult = {
  created: number;
  createdIds: number[];
  updated: number;
  failed: number;
  errors: BulkRowError[];
};
