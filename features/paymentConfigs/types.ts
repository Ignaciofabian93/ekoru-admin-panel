/**
 * Types for the payment-configs admin feature — ChileanPaymentConfig from
 * ekoru-transactions (AdminConfigResolver). One row per (seller, provider).
 * `apiKey`/`secretKey` are WRITE-ONLY: settable on the upsert row, never read
 * back, never exported.
 */

export const PAYMENT_PROVIDERS = ["KHIPU", "WEBPAY", "MERCADOPAGO"] as const;
export type ChileanPaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_ENVIRONMENTS = ["SANDBOX", "PRODUCTION"] as const;
export type PaymentEnvironment = (typeof PAYMENT_ENVIRONMENTS)[number];

export type RawCatalogPageInfo = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageSize: number;
};

export type RawPaymentConfig = {
  id: string;
  sellerId: string;
  provider: ChileanPaymentProvider;
  merchantId: string | null;
  environment: PaymentEnvironment;
  isActive: boolean;
  webhookUrl: string | null;
  returnUrl: string | null;
  cancelUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentConfigUpsertRow = {
  id?: string | number;
  sellerId?: string;
  provider?: ChileanPaymentProvider;
  merchantId?: string | null;
  apiKey?: string | null;
  secretKey?: string | null;
  environment?: PaymentEnvironment;
  isActive?: boolean;
  webhookUrl?: string | null;
  returnUrl?: string | null;
  cancelUrl?: string | null;
};

export type BulkRowError = {
  index: number;
  id: string | number | null;
  message: string;
};

export type BulkUpsertResult = {
  created: number;
  createdIds: (string | number)[];
  updated: number;
  failed: number;
  errors: BulkRowError[];
};
