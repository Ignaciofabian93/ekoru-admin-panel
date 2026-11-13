import { NextResponse } from "next/server";
import { ADMIN_LOGOUT_PATH } from "@/config/endpoints";
import { forwardSetCookies } from "@/lib/api/forwardCookies";
import { gatewayFetch, gatewayHeaders } from "@/lib/api/gateway";

export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";

  const gatewayRes = await gatewayFetch(ADMIN_LOGOUT_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
      ...gatewayHeaders(req),
    },
    body: "{}",
  });

  const data = await gatewayRes.json().catch(() => ({ success: true }));
  const res = NextResponse.json(data, { status: gatewayRes.status });

  // Gateway emits `clearCookie` Set-Cookie headers; forward them so the
  // browser drops the local cookies even if it ignored the gateway's domain.
  forwardSetCookies(gatewayRes, res);
  return res;
}
