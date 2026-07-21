import { type SupportedLanguage } from "@/constants/settings";

const LOCALE: Record<SupportedLanguage, string> = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
};

/** ISO datetime → "YYYY-MM-DD" for a date <input>, or "" when null. */
export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

/** "YYYY-MM-DD" from a date <input> → ISO string (UTC midnight), or null. */
export function fromDateInputValue(value: string): string | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

const fmt = (iso: string, lang: SupportedLanguage) =>
  new Date(iso).toLocaleDateString(LOCALE[lang], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

/** Human date range: single date, "from – to", or "" when unset. */
export function formatEventDates(
  startDate: string | null,
  endDate: string | null,
  lang: SupportedLanguage,
): string {
  if (!startDate && !endDate) return "";
  if (startDate && endDate && startDate.slice(0, 10) !== endDate.slice(0, 10)) {
    return `${fmt(startDate, lang)} – ${fmt(endDate, lang)}`;
  }
  const single = startDate ?? endDate;
  return single ? fmt(single, lang) : "";
}
