import { type SupportedLanguage } from "@/constants/settings";
import { ImpactProvider } from "@/features/impact/ui/ImpactProvider";
import { ImpactMessageFormScreen } from "@/features/impact/ui/ImpactMessageFormScreen";

export default async function NewCo2ImpactMessagePage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ImpactProvider lang={lang}>
      <ImpactMessageFormScreen lang={lang} kind="co2" />
    </ImpactProvider>
  );
}
