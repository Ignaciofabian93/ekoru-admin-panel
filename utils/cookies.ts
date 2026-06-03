const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Writes a client-side cookie. No-op during SSR. */
export function setCookie(
  name: string,
  value: string,
  maxAgeSeconds = ONE_YEAR_SECONDS,
): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${value};path=/;max-age=${maxAgeSeconds};samesite=lax`;
}

/** Reads a client-side cookie. Returns null during SSR or when absent. */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
