import type { SupportedLanguage } from "@/constants/settings";

/** Backend `Language` enum values understood by ekoru-users (the subset we ship). */
export type BackendLanguage = "ES" | "EN" | "FR";

/** Every backend `Language` value, for translation editors that target any locale. */
export const BACKEND_LANGUAGES: BackendLanguage[] = ["ES", "EN", "FR"];

/**
 * Maps the active route locale (`es`/`en`/`fr`) to the gateway's `Language` enum
 * (`ES`/`EN`/`FR`). Every GraphQL operation takes a `$language` variable fed from
 * here so translated reads follow the UI language.
 */
export const toBackendLanguage = (lang: SupportedLanguage): BackendLanguage =>
  lang.toUpperCase() as BackendLanguage;
