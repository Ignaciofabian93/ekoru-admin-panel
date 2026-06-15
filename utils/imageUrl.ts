import { IMAGES_PUBLIC_BASE_URL } from "@/config/endpoints";

/**
 * Resolve a stored image reference to a fully-qualified CDN URL.
 *
 * Seller/profile imagery is persisted as relative R2 object keys (e.g.
 * `user_avatar/<id>/<file>.webp`), which `next/image` can't consume directly.
 * This prefixes them with the public images base; already-absolute URLs
 * (http/https) pass through unchanged. Returns `null` for empty input so callers
 * can branch to a placeholder.
 */
export function resolveImageUrl(ref?: string | null): string | null {
  if (!ref) return null;
  if (/^https?:\/\//i.test(ref)) return ref;
  return `${IMAGES_PUBLIC_BASE_URL}/${ref.replace(/^\/+/, "")}`;
}
