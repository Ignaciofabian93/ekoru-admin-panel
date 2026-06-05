import type { Language, TransactionKind } from "./enums";

// Seller labels & levels mirror the GraphQL entities in ekoru-users
// (src/account/entities/* and src/sellers/entities/seller-level*).

export type SellerLabelTranslation = {
  id: number;
  sellerLabelId: number;
  language: Language;
  labelName: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SellerLabel = {
  id: number;
  labelName: string;
  transactionKind: TransactionKind;
  transactionsRequired: number;
  description?: string | null;
  badgeIcon?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translations?: SellerLabelTranslation[];
};

export type SellerLevelTranslation = {
  id: number;
  sellerLevelId: number;
  language: Language;
  levelName: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SellerLevel = {
  id: number;
  levelName: string;
  minPoints: number;
  maxPoints?: number | null;
  /** Free-form JSON describing the level's perks. */
  benefits?: unknown;
  badgeIcon?: string | null;
  createdAt?: string;
  updatedAt?: string;
  translations?: SellerLevelTranslation[];
};
