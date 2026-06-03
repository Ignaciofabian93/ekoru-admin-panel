import { redirect } from "next/navigation";
import { DEFAULT_LANGUAGE } from "@/constants/settings";

// The proxy normally rewrites `/` to `/[locale]` before this renders; this is the
// safety net for any request that reaches the root layout without a locale prefix.
export default function RootPage() {
  redirect(`/${DEFAULT_LANGUAGE}`);
}
