import { type SupportedLanguage } from "@/constants/settings";
import { BusinessServiceDesk } from "@/features/businessServiceDesk/screens/BusinessServiceDesk";

export default async function BusinessBookingsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <BusinessServiceDesk lang={lang} />;
}
