"use client";

import { useQuery } from "@apollo/client/react";
import { GET_SELLER } from "@/graphql/sellers/queries";
import { GET_RAW_SERVICES } from "@/graphql/services/queries";
import { GET_RAW_STORE_PRODUCTS } from "@/graphql/storeProducts/queries";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useAdmin } from "@/store/useAuthStore";
import type { Seller } from "@/types/user";

interface Counted {
  pageInfo: { totalCount: number };
}

/**
 * Everything the business area needs about the signed-in admin's own business.
 *
 * A BUSINESS admin is scoped to one seller (`admin.sellerId`); a PLATFORM admin
 * has none, and this screen is hidden from them by the nav's `adminType` rule.
 * The counts come from the same admin catalog queries the list screens use,
 * asked for one row at a time — only `totalCount` is wanted.
 */
export function useMyBusiness() {
  const admin = useAdmin();
  const language = useGqlLanguage();
  const sellerId = admin?.sellerId;

  const { data: sellerData, loading: sellerLoading } = useQuery<{
    getSeller: Seller | null;
  }>(GET_SELLER, {
    variables: { id: sellerId, language },
    skip: !sellerId,
  });

  const { data: productsData } = useQuery<{ rawStoreProducts: Counted }>(
    GET_RAW_STORE_PRODUCTS,
    { variables: { sellerId, page: 1, pageSize: 1 }, skip: !sellerId },
  );

  const { data: servicesData } = useQuery<{ rawServices: Counted }>(GET_RAW_SERVICES, {
    variables: { sellerId, page: 1, pageSize: 1 },
    skip: !sellerId,
  });

  return {
    sellerId,
    seller: sellerData?.getSeller ?? null,
    loading: sellerLoading && !sellerData,
    storeProductCount: productsData?.rawStoreProducts.pageInfo.totalCount ?? 0,
    serviceCount: servicesData?.rawServices.pageInfo.totalCount ?? 0,
  };
}
