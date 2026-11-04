import { type SupportedLanguage } from "@/constants/settings";
import { BusinessOrders } from "@/features/businessOrders/screens/BusinessOrders";

export default async function BusinessOrderPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return <BusinessOrders lang={lang} id={id} />;
}
