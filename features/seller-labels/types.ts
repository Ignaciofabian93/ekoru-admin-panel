import type { SellerLabel } from "@/types/account";
import type { TransactionKind } from "@/types/enums";
import type { BackendLanguage } from "@/utils/language";

export type SellerLabelsResult = { sellerLabels: SellerLabel[] };
export type SellerLabelResult = { sellerLabel: SellerLabel | null };

export type CreateSellerLabelInput = {
  labelName: string;
  transactionKind: TransactionKind;
  transactionsRequired: number;
  description?: string;
  badgeIcon?: string;
};

export type UpdateSellerLabelInput = Partial<CreateSellerLabelInput>;

export type UpsertSellerLabelTranslationInput = {
  sellerLabelId: number;
  language: BackendLanguage;
  labelName: string;
  description?: string;
};
