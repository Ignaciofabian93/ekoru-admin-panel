import { type SupportedLanguage } from "@/constants/settings";
import { ImpactProvider } from "@/features/impact/ui/ImpactProvider";
import { MaterialImpactFormScreen } from "@/features/impact/ui/MaterialImpactFormScreen";

export default async function EditMaterialImpactPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <ImpactProvider lang={lang}>
      <MaterialImpactFormScreen lang={lang} id={Number(id)} />
    </ImpactProvider>
  );
}
