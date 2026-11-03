import { type SupportedLanguage } from "@/constants/settings";
import { BusinessPublish } from "@/features/businessPublish/screens/BusinessPublish";

export default async function BusinessPublishPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <BusinessPublish lang={lang} />;
}
