import type { Seller } from "@/types/user";

export type SellerListResult = {
  adminSellers: { items: Seller[]; total: number };
};

export type SellerResult = {
  adminSeller: Seller | null;
};

/** Resolves a human-readable name from whichever profile the seller has. */
export const sellerDisplayName = (seller: Seller): string => {
  const profile = seller.profile;
  if (!profile) return seller.email;
  if (profile.__typename === "PersonProfile") {
    return (
      profile.displayName ||
      [profile.firstName, profile.lastName].filter(Boolean).join(" ") ||
      seller.email
    );
  }
  return profile.businessName || seller.email;
};
