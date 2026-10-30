import type { AnalyticsRange } from "@/components/Charts";

export type Bucket = "DAY" | "WEEK" | "MONTH";

export type AnalyticsPeriod = {
  range: AnalyticsRange;
  bucket: Bucket;
  from: string;
  to: string;
  previousFrom: string;
};

export type Breakdown = { key: string; count: number; amount: number };
export type SearchTerm = { query: string; searches: number; clicks: number };

export type PlatformTotals = {
  grossSales: number;
  revenue: number;
  commissions: number;
  memberships: number;
  payments: number;
  averageTicket: number;
  refunded: number;
  failedPayments: number;
  transactions: number;
  newSellers: number;
  co2SavedKg: number;
  waterSavedLt: number;
  views: number;
  searches: number;
};

export type PlatformPoint = {
  bucket: string;
  grossSales: number;
  revenue: number;
  storeOrders: number;
  serviceQuotes: number;
  serviceBookings: number;
  marketplaceSales: number;
  exchanges: number;
  memberships: number;
  newPersons: number;
  newStartups: number;
  newCompanies: number;
  views: number;
};

export type PlatformAnalytics = {
  period: AnalyticsPeriod;
  current: PlatformTotals;
  previous: PlatformTotals;
  series: PlatformPoint[];
  transactionsByKind: Breakdown[];
  paymentsByStatus: Breakdown[];
  newSellersByType: Breakdown[];
  topSearches: SearchTerm[];
  unmetSearches: SearchTerm[];
  topCategories: { catalog: string; name: string; views: number }[];
  listings: { marketplace: number; store: number; services: number };
};

export type BusinessTotals = {
  grossSales: number;
  fees: number;
  refunded: number;
  netPayout: number;
  orders: number;
  paidQuotes: number;
  averageTicket: number;
  quotesRequested: number;
  quotesAccepted: number;
  bookings: number;
  deals: number;
  views: number;
  likes: number;
  conversionRate: number;
  reviews: number;
  co2SavedKg: number;
  waterSavedLt: number;
};

export type BusinessAnalytics = {
  period: AnalyticsPeriod;
  current: BusinessTotals;
  previous: BusinessTotals;
  series: {
    bucket: string;
    grossSales: number;
    netPayout: number;
    orders: number;
    views: number;
  }[];
  rating: number | null;
};

export type ItemType = "PRODUCT" | "STORE_PRODUCT" | "SERVICE";

export type ItemPerformance = {
  itemId: number;
  itemType: ItemType;
  name: string;
  isActive: boolean;
  views: number;
  likes: number;
  totalLikes: number;
  unitsSold: number;
  revenue: number;
  quoteRequests: number;
  bookings: number;
  conversionRate: number;
  rating: number | null;
  reviews: number;
};

export type Sale = {
  paymentId: number;
  date: string;
  type: "ORDER" | "QUOTATION";
  orderId: number | null;
  quotationId: number | null;
  status: string;
  amount: number;
  fee: number;
  refunded: number;
  net: number;
  units: number;
};

export type SalesPageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

export type SearchInsights = {
  period: AnalyticsPeriod;
  foundBy: SearchTerm[];
  viewsBySource: { key: string; count: number }[];
  topSearches: SearchTerm[];
  unmetSearches: SearchTerm[];
};
