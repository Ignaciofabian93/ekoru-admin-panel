import { NextResponse, type NextRequest } from "next/server";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE,
  SUPPORTED_LANGUAGES,
} from "@/constants/settings";

// The admin panel is private: every route requires a session EXCEPT the ones
// below (evaluated AFTER the leading `/[lang]` segment is stripped).
const PUBLIC_PATTERNS: RegExp[] = [/^\/login(\/|$)/, /^\/?$/];

const SUPPORTED = SUPPORTED_LANGUAGES as readonly string[];

function getLocale(request: NextRequest): string {
  // A saved choice wins over the browser's Accept-Language preference.
  const cookieLang = request.cookies.get(LANGUAGE_COOKIE)?.value ?? "";
  if (SUPPORTED.includes(cookieLang)) return cookieLang;

  const acceptLang = request.headers.get("Accept-Language") ?? "";
  const firstCode = acceptLang.split(",")[0]?.split("-")[0]?.trim().toLowerCase() ?? "";
  return SUPPORTED.includes(firstCode) ? firstCode : DEFAULT_LANGUAGE;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const segments = pathname.split("/");
  const maybeLang = segments[1] ?? "";
  const hasLangPrefix = SUPPORTED.includes(maybeLang);

  if (!hasLangPrefix) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const rest = `/${segments.slice(2).join("/")}`;
  const isPublic = PUBLIC_PATTERNS.some((rx) => rx.test(rest));
  if (isPublic) return NextResponse.next();

  // Either cookie is enough: if only `refreshToken` is present, the axios
  // client will exchange it for a fresh `token` on the first 401.
  const hasSession = request.cookies.has("token") || request.cookies.has("refreshToken");
  if (hasSession) return NextResponse.next();

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = `/${maybeLang}/login`;
  loginUrl.search = "";
  loginUrl.searchParams.set("redirectTo", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
