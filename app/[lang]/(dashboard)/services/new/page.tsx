import { type SupportedLanguage } from "@/constants/settings";
import { ServicesProvider } from "@/features/services/ui/ServicesProvider";
import { ServiceFormScreen } from "@/features/services/ui/ServiceFormScreen";

export default async function NewServicePage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ServicesProvider lang={lang}>
      <ServiceFormScreen lang={lang} />
    </ServicesProvider>
  );
}
