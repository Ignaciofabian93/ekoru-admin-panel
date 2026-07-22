import { type SupportedLanguage } from "@/constants/settings";
import { ImpactProvider } from "@/features/impact/ui/ImpactProvider";
import { MaterialImpactsScreen } from "@/features/impact/ui/MaterialImpactsScreen";

export default async function MaterialImpactsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ImpactProvider lang={lang}>
      <MaterialImpactsScreen lang={lang} />
    </ImpactProvider>
  );
}
