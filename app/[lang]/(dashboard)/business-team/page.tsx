import { type SupportedLanguage } from "@/constants/settings";
import { BusinessTeam } from "@/features/businessTeam/screens/BusinessTeam";

export default async function BusinessTeamPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <BusinessTeam lang={lang} />;
}
