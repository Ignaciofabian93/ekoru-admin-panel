import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GRAPHQL_URL } from "@/config/endpoints";

type GraphQLPayload = { data?: unknown; errors?: unknown };

function isGraphQLPayload(value: unknown): value is GraphQLPayload {
  return (
    typeof value === "object" && value !== null && ("data" in value || "errors" in value)
  );
}

export async function POST(req: Request) {
  const body = await req.text();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  const raw = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }

  // The gateway sometimes returns 4xx alongside a well-formed GraphQL body
  // (e.g. validation errors). Apollo's HttpLink treats any non-2xx as a
  // network error and throws a generic "Response not successful" message
  // instead of surfacing the actual `errors[]` — so we always return 200
  // when the body is a valid GraphQL payload.
  if (!res.ok) {
    console.error(
      `[graphql-proxy] upstream ${res.status} ${res.statusText} — body:`,
      raw.slice(0, 2000),
    );
  }

  if (isGraphQLPayload(parsed)) {
    return NextResponse.json(parsed, { status: 200 });
  }

  return NextResponse.json(
    { errors: [{ message: `Upstream ${res.status}: ${raw.slice(0, 500)}` }] },
    { status: 200 },
  );
}
