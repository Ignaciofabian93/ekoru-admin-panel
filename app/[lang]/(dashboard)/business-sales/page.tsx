import { type SupportedLanguage } from "@/constants/settings";
import { BusinessSales } from "@/features/analytics/screens/BusinessAnalyticsScreens";

export default async function BusinessSalesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <BusinessSales lang={lang} />;
}
