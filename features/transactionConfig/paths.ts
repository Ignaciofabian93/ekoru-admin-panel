import { type SupportedLanguage } from "@/constants/settings";
import { KIND_CONFIG, type TxConfigKind, type TxId } from "./types";

/** Routes for a transaction-config table, matching the sidebar `to` value. */
export const transactionConfigPaths = (kind: TxConfigKind) => {
  const seg = KIND_CONFIG[kind].route;
  return {
    list: (lang: SupportedLanguage) => `/${lang}/${seg}`,
    new: (lang: SupportedLanguage) => `/${lang}/${seg}/new`,
    edit: (lang: SupportedLanguage, id: TxId) => `/${lang}/${seg}/${id}/edit`,
  };
};
