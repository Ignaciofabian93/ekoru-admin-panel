export const SUPPORTED_LANGUAGES = ["es", "en", "fr"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "es";
export const LANGUAGE_STORAGE_KEY = "app_language";
/** Cookie that persists the user's locale choice so middleware can read it server-side. */
export const LANGUAGE_COOKIE = "NEXT_LOCALE";

export const hasLocale = (locale: string): locale is SupportedLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(locale);

const ALL_LANGUAGE_NAMES: Record<string, string> = {
  es: "Español",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
};

export const LANGUAGES_AVAILABLE = SUPPORTED_LANGUAGES.map((code) => ({
  code,
  name: ALL_LANGUAGE_NAMES[code],
}));
