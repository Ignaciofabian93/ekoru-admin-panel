import type { SupportedLanguage } from "@/constants/settings";
import type en from "./locales/en.json";

const loaders = {
  en: () => import("./locales/en.json").then((m) => m.default),
  es: () => import("./locales/es.json").then((m) => m.default),
  fr: () => import("./locales/fr.json").then((m) => m.default),
} satisfies Record<SupportedLanguage, () => Promise<unknown>>;

export const NAMESPACE = "operations";

export type OperationsDictionary = typeof en;

export const getOperationsDictionary = (lang: SupportedLanguage) =>
  loaders[lang]() as Promise<OperationsDictionary>;
