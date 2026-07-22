import { type SupportedLanguage } from "@/constants/settings";
import { ImpactProvider } from "@/features/impact/ui/ImpactProvider";
import { ImpactMessageFormScreen } from "@/features/impact/ui/ImpactMessageFormScreen";

export default async function EditCo2ImpactMessagePage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <ImpactProvider lang={lang}>
      <ImpactMessageFormScreen lang={lang} kind="co2" id={Number(id)} />
    </ImpactProvider>
  );
}
