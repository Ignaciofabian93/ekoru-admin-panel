import { type SupportedLanguage } from "@/constants/settings";
import { ImpactProvider } from "@/features/impact/ui/ImpactProvider";
import { MaterialImpactFormScreen } from "@/features/impact/ui/MaterialImpactFormScreen";

export default async function NewMaterialImpactPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ImpactProvider lang={lang}>
      <MaterialImpactFormScreen lang={lang} />
    </ImpactProvider>
  );
}
