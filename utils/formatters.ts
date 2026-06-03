export const formatInitials = (displayName: string): string => {
  const formatted: string = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return formatted;
};

/** Formats an ISO date string to a locale-aware short date. Returns "—" when empty. */
export const formatDate = (value?: string | null, locale = "es"): string => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};
