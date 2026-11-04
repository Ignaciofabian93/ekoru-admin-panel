import type { OrderStatus, PageInfo, ShippingStage } from "@/features/operations/types";

export type { OrderStatus, ShippingStage };

type BuyerProfile =
  | {
      __typename?: "PersonProfile";
      displayName?: string | null;
      firstName?: string | null;
      lastName?: string | null;
    }
  | { __typename?: "BusinessProfile"; businessName?: string | null };

export type BusinessOrderBuyer = {
  id: string;
  email: string | null;
  phone: string | null;
  profile: BuyerProfile | null;
} | null;

export type BusinessOrderItem = {
  id: string;
  quantity: number;
  price: number;
  storeProductId: number | null;
  storeProduct: { id: string; name: string; images: string[] | null } | null;
};

export type BusinessOrderAddress = {
  id: string;
  recipientName: string;
  phone: string;
  countryId: number;
  regionId: number;
  cityId: number;
  countyId: number;
  street: string;
  reference: string | null;
  zipCode: string | null;
};

export type BusinessOrder = {
  id: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  createdAt: string;
  shippingMethod: string;
  shippingStatus: {
    id: string;
    status: ShippingStage;
    trackingInfo: string | null;
  } | null;
  buyer: BusinessOrderBuyer;
  orderItems: BusinessOrderItem[];
  shippingAddress?: BusinessOrderAddress | null;
};

export type BusinessOrdersData = {
  getOrdersBySeller: { nodes: BusinessOrder[]; pageInfo: PageInfo };
  toShip: { pageInfo: { totalCount: number } };
};

/**
 * The views a store's team works from, as on the web's "Mis ventas": what to
 * ship first, then the rest. Each maps to the query's status and stage.
 */
export const ORDER_FILTERS = {
  toShip: { status: "PAID", stage: "PREPARING" },
  shipped: { status: "PAID", stage: "SHIPPED" },
  delivered: { status: "PAID", stage: "DELIVERED" },
  pending: { status: "PENDING_PAYMENT" },
  canceled: { status: "CANCELED" },
  all: {},
} as const;

export type OrderFilter = keyof typeof ORDER_FILTERS;

/** Where shipping may move from each stage (the backend's `shipping-rules.ts`). */
export const NEXT_STAGES: Record<ShippingStage, ShippingStage[]> = {
  PREPARING: ["SHIPPED", "DELIVERED", "CANCELED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["RETURNED"],
  RETURNED: [],
  CANCELED: [],
};

/** The buyer's name as the web shows it, or their email. */
export function buyerName(buyer: BusinessOrderBuyer): string | null {
  const profile = buyer?.profile;
  if (profile && "businessName" in profile && profile.businessName) {
    return profile.businessName;
  }
  if (profile && "firstName" in profile) {
    const full = [profile.firstName, profile.lastName].filter(Boolean).join(" ");
    return profile.displayName || full || buyer?.email || null;
  }
  return buyer?.email ?? null;
}
