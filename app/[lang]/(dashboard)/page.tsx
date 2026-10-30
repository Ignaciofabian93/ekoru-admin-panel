import { type SupportedLanguage } from "@/constants/settings";
import { getAnalyticsDictionary, NAMESPACE } from "@/features/analytics/i18n";
import { Overview } from "@/features/dashboard/screens/Overview";
import { DictionaryProvider } from "@/i18n/context";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  // The home page carries the analytics dashboards (ADM-13/16).
  const analytics = await getAnalyticsDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: analytics }}>
      <Overview lang={lang} />
    </DictionaryProvider>
  );
}
