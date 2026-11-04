import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATEWAY_BASE_URL } from "@/config/endpoints";

const ACTIONS = new Set(["remove", "cover"]);

// Proxies the business catalog's photo actions (ADM-16) to the gateway's
// `/api/panel/business-images`, with the same HttpOnly cookie → Bearer bridge
// as the asset route. A multipart body adds a photo (`image`, `itemType`,
// `itemId`); a JSON body `{ action, itemType, itemId, key }` removes one or
// makes it the cover. The gateway checks the account, its plan and that the
// listing is the business's own, and answers the new photo list, or a `code`
// the panel words in the admin's language.
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const auth: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const base = `${GATEWAY_BASE_URL}/api/panel/business-images`;

  let gatewayRes: Response;
  if (req.headers.get("content-type")?.includes("multipart/form-data")) {
    const incoming = await req.formData();
    const file = incoming.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No image provided" }, { status: 400 });
    }
    const forward = new FormData();
    forward.append("image", file, file.name || "upload.jpg");
    forward.append("itemType", String(incoming.get("itemType") ?? ""));
    forward.append("itemId", String(incoming.get("itemId") ?? ""));
    // Do NOT set Content-Type — fetch derives the multipart boundary itself.
    gatewayRes = await fetch(base, { method: "POST", headers: auth, body: forward });
  } else {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "";
    if (!ACTIONS.has(action)) {
      return NextResponse.json({ message: "Unknown action" }, { status: 400 });
    }
    gatewayRes = await fetch(`${base}/${action}`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        itemType: body.itemType,
        itemId: String(body.itemId ?? ""),
        key: body.key,
      }),
    });
  }

  const raw = await gatewayRes.text();
  try {
    return NextResponse.json(raw ? JSON.parse(raw) : {}, { status: gatewayRes.status });
  } catch {
    console.error(
      `[images/business] gateway ${gatewayRes.status} non-JSON body:`,
      raw.slice(0, 500),
    );
    return NextResponse.json(
      { message: "Gateway returned a non-JSON response", status: gatewayRes.status },
      { status: 502 },
    );
  }
}
