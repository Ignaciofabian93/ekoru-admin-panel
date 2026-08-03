import { type SupportedLanguage } from "@/constants/settings";
import { ServicesProvider } from "@/features/services/ui/ServicesProvider";
import { ServicesScreen } from "@/features/services/ui/ServicesScreen";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ServicesProvider lang={lang}>
      <ServicesScreen lang={lang} />
    </ServicesProvider>
  );
}
