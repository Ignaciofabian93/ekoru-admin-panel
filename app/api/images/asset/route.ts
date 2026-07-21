import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GATEWAY_BASE_URL } from "@/config/endpoints";

// Proxies a single asset image upload (blog cover, event cover) to the gateway.
// The browser posts a multipart body to this same-origin route; we read the
// HttpOnly `token` cookie and forward the file + `entityId` to the gateway with
// a Bearer header — the same cookie→Bearer bridge used by the GraphQL route.
//
// The gateway's generic asset endpoint (`/api/images/upload/department`, entity
// `asset`) hands the bytes to ekoru-image-processor, which writes the WebP to R2
// and returns `{ success, key, imageUrl }` — `imageUrl` is the public CDN URL we
// then store in the post/event `coverImage` field via the GraphQL mutation. We
// surface a 502 if the gateway response is missing a key so callers never get a
// silent null.
export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const incoming = await req.formData();
  const file = incoming.get("image") ?? incoming.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No image provided" }, { status: 400 });
  }

  // Namespaces the R2 key. Callers pass e.g. "blog" or "event"; default keeps
  // uploads grouped even if the caller omits it.
  const entityId =
    typeof incoming.get("entityId") === "string"
      ? (incoming.get("entityId") as string)
      : "asset";

  const forward = new FormData();
  forward.append("image", file, file.name || "upload.jpg");
  forward.append("entityId", entityId);

  const gatewayUrl = `${GATEWAY_BASE_URL}/api/images/upload/department`;
  const gatewayRes = await fetch(gatewayUrl, {
    method: "POST",
    // Do NOT set Content-Type — fetch derives the multipart boundary itself.
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: forward,
  });

  const raw = await gatewayRes.text();
  let data: Record<string, unknown> = {};
  try {
    data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    console.error(
      `[images/asset] gateway ${gatewayRes.status} non-JSON body from ${gatewayUrl}:`,
      raw.slice(0, 500),
    );
    return NextResponse.json(
      { message: "Gateway returned a non-JSON response", status: gatewayRes.status },
      { status: 502 },
    );
  }

  if (gatewayRes.ok && (typeof data.imageUrl !== "string" || !data.imageUrl)) {
    console.error(
      `[images/asset] gateway ${gatewayRes.status} 2xx without an imageUrl:`,
      data,
    );
    return NextResponse.json(
      { message: "Gateway response missing image URL", gatewayBody: data },
      { status: 502 },
    );
  }

  return NextResponse.json(data, { status: gatewayRes.status });
}
