import type { SellerLevel } from "@/types/account";
import type { BackendLanguage } from "@/utils/language";

export type SellerLevelsResult = { sellerLevels: SellerLevel[] };
export type SellerLevelResult = { sellerLevel: SellerLevel | null };

export type CreateSellerLevelInput = {
  levelName: string;
  minPoints: number;
  maxPoints?: number;
  benefits?: unknown;
  badgeIcon?: string;
};

export type UpdateSellerLevelInput = Partial<CreateSellerLevelInput>;

export type UpsertSellerLevelTranslationInput = {
  sellerLevelId: number;
  language: BackendLanguage;
  levelName: string;
};
