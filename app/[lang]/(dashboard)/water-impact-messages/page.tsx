import { type SupportedLanguage } from "@/constants/settings";
import { ImpactProvider } from "@/features/impact/ui/ImpactProvider";
import { ImpactMessagesScreen } from "@/features/impact/ui/ImpactMessagesScreen";

export default async function WaterImpactMessagesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <ImpactProvider lang={lang}>
      <ImpactMessagesScreen lang={lang} kind="water" />
    </ImpactProvider>
  );
}
