import { type SupportedLanguage } from "@/constants/settings";
import { ServicesProvider } from "@/features/services/ui/ServicesProvider";
import { ServiceFormScreen } from "@/features/services/ui/ServiceFormScreen";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <ServicesProvider lang={lang}>
      <ServiceFormScreen lang={lang} id={Number(id)} />
    </ServicesProvider>
  );
}
