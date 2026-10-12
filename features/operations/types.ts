/** Shapes returned by the operations documents (graphql/operations). */

export type Party = { id: string; email: string | null } | null;

export type PageInfo = {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type Connection<T> = { nodes: T[]; pageInfo: PageInfo };

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "CANCELED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const SHIPPING_STAGES = [
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
  "CANCELED",
] as const;
export type ShippingStage = (typeof SHIPPING_STAGES)[number];

export type OrderRow = {
  id: string;
  status: OrderStatus;
  total: number;
  currency: string;
  shippingMethod: string;
  createdAt: string;
  buyerId: string;
  sellerId: string;
  shippingStatus: { status: ShippingStage } | null;
  buyer: Party;
  seller: Party;
};

export type OrderDetail = OrderRow & {
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  updatedAt: string;
  shippingAddress: {
    recipientName: string;
    phone: string;
    street: string;
    reference: string | null;
    zipCode: string | null;
  } | null;
  orderItems: {
    id: string;
    productId: number | null;
    storeProductId: number | null;
    quantity: number;
    price: number;
  }[];
};

export const PAYMENT_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "EXPIRED",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_TYPES = ["ORDER", "QUOTATION", "MEMBERSHIP"] as const;
export type PaymentType = (typeof PAYMENT_TYPES)[number];

export type PaymentRow = {
  id: string;
  status: PaymentStatus;
  paymentType: PaymentType;
  paymentProvider: string;
  amount: number;
  currency: string;
  orderId: number | null;
  quotationId: number | null;
  externalId: string | null;
  failureReason: string | null;
  createdAt: string;
  processedAt: string | null;
  refundedAt: string | null;
  payer: Party;
  receiver: Party;
};

export type PaymentDetail = PaymentRow & { description: string | null };

export type RefundRow = {
  id: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
};

export const DEAL_STATUSES = [
  "DISPUTED",
  "PROPOSED",
  "ACCEPTED",
  "COMPLETED",
  "EXPIRED",
  "CANCELLED",
  "DECLINED",
] as const;
export type DealStatus = (typeof DEAL_STATUSES)[number];

export type DealRow = {
  id: number;
  type: "SALE" | "EXCHANGE";
  status: DealStatus;
  compensationAmount: number;
  agreedAt: string | null;
  confirmationDeadline: string | null;
  buyerConfirmedAt: string | null;
  sellerConfirmedAt: string | null;
  buyerEvidenceUrl: string | null;
  sellerEvidenceUrl: string | null;
  disputedAt: string | null;
  disputeReason: string | null;
  cancelReason: string | null;
  createdAt: string;
  buyerId: string;
  sellerId: string;
  buyer: Party;
  seller: Party;
};

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type BookingRow = {
  id: string;
  status: BookingStatus;
  scheduledDate: string;
  scheduledTimeSlot: string | null;
  agreedPrice: number;
  clientNotes: string | null;
  providerNotes: string | null;
  cancellationReason: string | null;
  cancelledBy: string | null;
  createdAt: string;
  client: Party;
  provider: Party;
  service: { id: string; name: string } | null;
};

export const QUOTATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "COMPLETED",
  "DECLINED",
  "CANCELLED",
  "EXPIRED",
] as const;
export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

export type QuotationRow = {
  id: string;
  title: string;
  status: QuotationStatus;
  estimatedPrice: number | null;
  finalPrice: number | null;
  paidAt: string | null;
  declineReason: string | null;
  cancellationReason: string | null;
  createdAt: string;
  client: Party;
  provider: Party;
  service: { id: string; name: string } | null;
};

/** Formats an amount in Chilean pesos (or the given currency). */
export const formatMoney = (amount: number | null | undefined, currency = "CLP") =>
  amount == null
    ? "—"
    : new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "CLP" ? 0 : 2,
      }).format(amount);
