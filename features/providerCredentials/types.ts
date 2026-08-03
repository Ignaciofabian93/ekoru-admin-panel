/**
 * Types for the provider-credentials admin feature — the raw admin surface of
 * ekoru-services (AdminServicesResolver): ServiceProviderCredentials, one row
 * per seller. The `certifications` JSON column is not admin-editable.
 */

export type RawCatalogPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

export type RawProviderCredentials = {
  id: number;
  sellerId: string;
  licenseNumber: string | null;
  licenseType: string | null;
  licenseExpiryDate: string | null;
  isLicenseVerified: boolean;
  insuranceProvider: string | null;
  insurancePolicyNumber: string | null;
  insuranceExpiryDate: string | null;
  insuranceCoverage: number | null;
  backgroundCheckDate: string | null;
  backgroundCheckStatus: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProviderCredentialsUpsertRow = {
  id?: number;
  sellerId?: string;
  licenseNumber?: string | null;
  licenseType?: string | null;
  licenseExpiryDate?: string | null;
  isLicenseVerified?: boolean;
  insuranceProvider?: string | null;
  insurancePolicyNumber?: string | null;
  insuranceExpiryDate?: string | null;
  insuranceCoverage?: number | null;
  backgroundCheckDate?: string | null;
  backgroundCheckStatus?: string | null;
};

export type BulkRowError = { index: number; id: number | null; message: string };

export type BulkUpsertResult = {
  created: number;
  createdIds: number[];
  updated: number;
  failed: number;
  errors: BulkRowError[];
};
