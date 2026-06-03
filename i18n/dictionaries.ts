import "server-only";

import { type SupportedLanguage } from "@/constants/settings";

const dictionaries = {
  en: () => import("./locales/en.json").then((m) => m.default),
  es: () => import("./locales/es.json").then((m) => m.default),
  fr: () => import("./locales/fr.json").then((m) => m.default),
} satisfies Record<SupportedLanguage, () => Promise<unknown>>;

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

export const getDictionary = async (locale: SupportedLanguage) =>
  dictionaries[locale]() as Promise<{
    metadata: { title: string; description: string };
    common: Record<string, string>;
    nav: Record<string, string>;
  }>;
