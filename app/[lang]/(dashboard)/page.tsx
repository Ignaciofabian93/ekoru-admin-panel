import { type SupportedLanguage } from "@/constants/settings";
import { Overview } from "@/features/dashboard/screens/Overview";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <Overview lang={lang} />;
}
