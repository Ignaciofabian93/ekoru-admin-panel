import { type SupportedLanguage } from "@/constants/settings";
import { Community } from "@/features/community/screens/Community";

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <Community lang={lang} />;
}
