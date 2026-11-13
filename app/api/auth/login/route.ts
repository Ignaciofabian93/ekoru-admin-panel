import { NextResponse } from "next/server";
import { ADMIN_AUTH_PATH } from "@/config/endpoints";
import { forwardSetCookies } from "@/lib/api/forwardCookies";
import { gatewayFetch, gatewayHeaders } from "@/lib/api/gateway";
import { refuseLargeBody } from "@/lib/api/requestLimits";

// Forwards the admin login request to the gateway and re-emits its Set-Cookie
// headers to the browser so the HttpOnly `token` / `refreshToken` cookies land
// on the Next.js origin. The raw JWT in the JSON body is stripped — the browser
// never needs it because every authenticated request carries the cookie.
export async function POST(req: Request) {
  const tooLarge = refuseLargeBody(req);
  if (tooLarge) return tooLarge;

  const body = await req.text();
  const acceptLanguage = req.headers.get("accept-language") ?? "";

  const gatewayRes = await gatewayFetch(ADMIN_AUTH_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": acceptLanguage,
      ...gatewayHeaders(req),
    },
    body,
  });

  const data = (await gatewayRes.json().catch(() => ({}))) as Record<string, unknown>;
  delete data.token;
  delete data.refreshToken;

  const res = NextResponse.json(data, { status: gatewayRes.status });
  forwardSetCookies(gatewayRes, res);
  return res;
}
