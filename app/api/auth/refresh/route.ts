import { NextResponse } from "next/server";
import { ADMIN_REFRESH_PATH } from "@/config/endpoints";
import { forwardSetCookies } from "@/lib/api/forwardCookies";
import { gatewayFetch, gatewayHeaders } from "@/lib/api/gateway";

// Forwards the browser's `refreshToken` cookie to the gateway and re-emits
// the new cookie pair. No body is sent — the gateway falls back to reading
// the cookie when `refreshToken` is missing from the body.
export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const acceptLanguage = req.headers.get("accept-language") ?? "";

  const gatewayRes = await gatewayFetch(ADMIN_REFRESH_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": acceptLanguage,
      Cookie: cookieHeader,
      ...gatewayHeaders(req),
    },
    body: "{}",
  });

  const data = (await gatewayRes.json().catch(() => ({}))) as Record<string, unknown>;
  delete data.token;
  delete data.refreshToken;

  const res = NextResponse.json(data, { status: gatewayRes.status });
  forwardSetCookies(gatewayRes, res);
  return res;
}
