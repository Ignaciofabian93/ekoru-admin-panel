import { type SupportedLanguage } from "@/constants/settings";
import { type ImpactMessageKind } from "./types";

// Routes for the marketplace impact tables, matching the sidebar `to` values.

export const impactPaths = {
  materialImpacts: (lang: SupportedLanguage) => `/${lang}/material-impacts`,
  materialImpactNew: (lang: SupportedLanguage) => `/${lang}/material-impacts/new`,
  materialImpactEdit: (lang: SupportedLanguage, id: number) =>
    `/${lang}/material-impacts/${id}/edit`,

  messages: (lang: SupportedLanguage, kind: ImpactMessageKind) =>
    `/${lang}/${kind}-impact-messages`,
  messageNew: (lang: SupportedLanguage, kind: ImpactMessageKind) =>
    `/${lang}/${kind}-impact-messages/new`,
  messageEdit: (lang: SupportedLanguage, kind: ImpactMessageKind, id: number) =>
    `/${lang}/${kind}-impact-messages/${id}/edit`,
};
