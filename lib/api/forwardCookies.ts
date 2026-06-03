import "server-only";
import type { NextResponse } from "next/server";

// Strip the `Domain` attribute from a Set-Cookie header. The gateway scopes
// cookies to `.ekoru.cl` (prod) or omits the domain (dev). Because we proxy
// the gateway through Next.js, the browser sees the cookie as coming from the
// Next.js host — keeping `Domain=.ekoru.cl` would be rejected on localhost,
// and is unnecessary in prod since the cookie defaults to the response host.
const STRIP_DOMAIN = /;\s*Domain=[^;]+/i;

export function forwardSetCookies(source: Response, target: NextResponse) {
  const cookies = source.headers.getSetCookie();
  for (const cookie of cookies) {
    target.headers.append("Set-Cookie", cookie.replace(STRIP_DOMAIN, ""));
  }
}
