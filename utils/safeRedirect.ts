/** Tabs, line breaks and the like, which browsers drop from a URL before reading it. */
const CONTROL_CHARACTER = /[\u0000-\u001F\u007F]/;

/**
 * A path inside this site, or null when `requested` could lead anywhere else.
 *
 * Only a path that starts with a single slash is accepted. Browsers read
 * `//host` and `/\host` as another site, and drop tabs and line breaks before
 * parsing, so `/<tab>/host` is one too. A full URL would send the visitor to
 * that site right after signing in (GW-7).
 */
export function safeRedirectPath(requested: string | null | undefined): string | null {
  if (!requested || !requested.startsWith("/") || requested.startsWith("//")) return null;
  // Backslashes and control characters never appear in our own paths.
  if (requested.includes("\\") || CONTROL_CHARACTER.test(requested)) return null;
  return requested;
}
