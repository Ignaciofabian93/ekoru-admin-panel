import "server-only";
import { NextResponse } from "next/server";

/** Largest JSON body a route accepts. The gateway and the subgraphs take 1 MB too (GW-6). */
export const MAX_JSON_BYTES = 1024 * 1024;

/**
 * A 413 when the request declares a body over the limit, otherwise null.
 * nginx buffers each request and always passes its Content-Length, so the
 * refusal comes before the body is read into memory.
 */
export function refuseLargeBody(req: Request, max = MAX_JSON_BYTES): NextResponse | null {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (!(declared > max)) return null;
  return NextResponse.json({ message: "Request body too large" }, { status: 413 });
}

/** True when the body is declared as JSON (`application/json`, with or without a charset). */
export function isJsonRequest(req: Request): boolean {
  const type = req.headers.get("content-type") ?? "";
  return type.split(";")[0].trim().toLowerCase() === "application/json";
}

/**
 * The visitor's address for a route's own counters. nginx overwrites X-Real-IP
 * on every request; the first X-Forwarded-For entry is whatever the caller sent.
 */
export function visitorAddress(req: Request): string {
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
