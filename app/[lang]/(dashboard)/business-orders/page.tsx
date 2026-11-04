import { type SupportedLanguage } from "@/constants/settings";
import { BusinessOrders } from "@/features/businessOrders/screens/BusinessOrders";

export default async function BusinessOrdersPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <BusinessOrders lang={lang} />;
}
