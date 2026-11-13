import "server-only";
import { GATEWAY_BASE_URL } from "@/config/endpoints";

/**
 * How this server reaches the gateway (INF-23).
 *
 * In Docker, compose sets GATEWAY_INTERNAL_URL to the gateway's address on the
 * shared network. A call then stays on the server instead of going out through
 * Cloudflare and back in through nginx, and the gateway learns the visitor's
 * address from `gatewayHeaders`. Without the variable (local development) the
 * public address is used.
 */
function internalBase(): string | null {
  const value = process.env.GATEWAY_INTERNAL_URL?.trim().replace(/\/+$/, "");
  return value ? value : null;
}

const IP_ADDRESS = /^[0-9a-fA-F:.]{3,45}$/;

/**
 * The visitor's address and browser, for the gateway's rate limits and
 * sign-in alerts.
 *
 * nginx overwrites X-Real-IP on every request, so the visitor can't choose it.
 * It is sent as X-Forwarded-For because that is what the gateway reads
 * (`trust proxy` 1: the last entry, which here is the only one). Without it
 * every visitor would count as this server and share one limit.
 */
export function gatewayHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  const ip = req.headers.get("x-real-ip")?.trim() ?? "";
  if (IP_ADDRESS.test(ip)) headers["X-Forwarded-For"] = ip;
  const userAgent = req.headers.get("user-agent");
  // Printable ASCII only: anything else makes fetch refuse the header.
  const browser = userAgent?.replace(/[^\x20-\x7E]/g, "").slice(0, 300);
  if (browser) headers["User-Agent"] = browser;
  return headers;
}

/** Failures that happen before a single byte is sent, so a retry can't repeat anything. */
const NEVER_CONNECTED = new Set(["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED"]);

function connectFailure(err: unknown): string | null {
  const code = (err as { cause?: { code?: unknown } } | null)?.cause?.code;
  return typeof code === "string" && NEVER_CONNECTED.has(code) ? code : null;
}

let lastWarning = 0;

/**
 * `fetch` against the gateway. `path` starts with a slash (`/graphql`,
 * `/session/auth`).
 *
 * If the inside address can't be reached at all (wrong name, wrong network),
 * the call goes to the public address instead, so a compose mistake costs the
 * per-visitor rate limits and not the whole site. It is logged at most once a
 * minute. A call that did connect is never repeated.
 */
export async function gatewayFetch(path: string, init?: RequestInit): Promise<Response> {
  const internal = internalBase();
  if (internal) {
    try {
      return await fetch(`${internal}${path}`, init);
    } catch (err) {
      const code = connectFailure(err);
      if (!code) throw err;
      const now = Date.now();
      if (now - lastWarning > 60_000) {
        lastWarning = now;
        console.error(
          `[gateway] ${internal} unreachable (${code}); using ${GATEWAY_BASE_URL} instead`,
        );
      }
    }
  }
  return fetch(`${GATEWAY_BASE_URL}${path}`, init);
}
