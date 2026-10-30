import type { SupportedLanguage } from "@/constants/settings";

/** Chilean formats for Spanish (EKORU's market); the language's own otherwise. */
const LOCALE: Record<SupportedLanguage, string> = {
  es: "es-CL",
  en: "en-US",
  fr: "fr-FR",
};

export const localeOf = (lang: SupportedLanguage) => LOCALE[lang] ?? "es-CL";

/** Pesos, whole: $1.234.567. `compact` for axes and tiles: $1,2 M. */
export function formatClp(
  value: number,
  lang: SupportedLanguage,
  compact = false,
): string {
  return new Intl.NumberFormat(localeOf(lang), {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

export function formatCount(
  value: number,
  lang: SupportedLanguage,
  compact = false,
): string {
  return new Intl.NumberFormat(localeOf(lang), {
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? "compact" : "standard",
  }).format(value);
}

/** A 0–1 ratio as a percentage. */
export function formatPercent(ratio: number, lang: SupportedLanguage): string {
  return new Intl.NumberFormat(localeOf(lang), {
    style: "percent",
    maximumFractionDigits: ratio > 0 && ratio < 0.1 ? 1 : 0,
  }).format(ratio);
}

/** Kilograms or liters, compact past a thousand. */
export function formatAmount(
  value: number,
  unit: string,
  lang: SupportedLanguage,
): string {
  return `${formatCount(value, lang, value >= 10_000)} ${unit}`;
}

/** A change as a signed percentage: +12 %, −3 %. */
export function formatChange(ratio: number, lang: SupportedLanguage): string {
  return new Intl.NumberFormat(localeOf(lang), {
    style: "percent",
    maximumFractionDigits: Math.abs(ratio) < 0.1 ? 1 : 0,
    signDisplay: "exceptZero",
  }).format(ratio);
}

/** Pesos for a headline figure: whole up to ten million, compact past it. */
export function formatMoneyFigure(value: number, lang: SupportedLanguage): string {
  return formatClp(value, lang, Math.abs(value) >= 10_000_000);
}

/**
 * Change against the previous period, as a ratio, or null when there was
 * nothing before (a rise from zero has no meaningful percentage).
 */
export function change(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return (current - previous) / Math.abs(previous);
}

/**
 * A bucket's first day ("2026-10-28") as a short axis label: the day and month
 * for days and weeks, the month and year for months.
 */
export function bucketLabel(
  bucket: string,
  granularity: "DAY" | "WEEK" | "MONTH",
  lang: SupportedLanguage,
): string {
  const [y, m, d] = bucket.split("-").map(Number);
  // Noon UTC keeps the calendar day whatever the viewer's time zone.
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  return new Intl.DateTimeFormat(localeOf(lang), {
    timeZone: "UTC",
    ...(granularity === "MONTH"
      ? { month: "short", year: "2-digit" }
      : { day: "numeric", month: "short" }),
  }).format(date);
}

/** Round, readable axis maximum and ticks for values from 0 to `max`. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 2.5, 5, 10].map((f) => f * magnitude).find((s) => s >= raw) ?? 10 * magnitude;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}
