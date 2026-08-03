import { type SupportedLanguage } from "@/constants/settings";
import { KIND_CONFIG, type SearchKind } from "./types";

/** Routes for a search-config table, matching the sidebar `to` value. */
export const searchConfigPaths = (kind: SearchKind) => {
  const seg = KIND_CONFIG[kind].route;
  return {
    list: (lang: SupportedLanguage) => `/${lang}/${seg}`,
    new: (lang: SupportedLanguage) => `/${lang}/${seg}/new`,
    edit: (lang: SupportedLanguage, id: number) => `/${lang}/${seg}/${id}/edit`,
  };
};
