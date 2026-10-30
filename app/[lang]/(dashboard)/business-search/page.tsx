import { type SupportedLanguage } from "@/constants/settings";
import { BusinessSearch } from "@/features/analytics/screens/BusinessAnalyticsScreens";

export default async function BusinessSearchPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <BusinessSearch lang={lang} />;
}
