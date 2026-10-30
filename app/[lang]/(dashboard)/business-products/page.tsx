import { type SupportedLanguage } from "@/constants/settings";
import { BusinessProducts } from "@/features/analytics/screens/BusinessAnalyticsScreens";

export default async function BusinessProductsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <BusinessProducts lang={lang} />;
}
