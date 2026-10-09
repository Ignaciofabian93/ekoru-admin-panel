import { type SupportedLanguage } from "@/constants/settings";
import { CommunityEventsProvider } from "@/features/communityEvents/ui/CommunityEventsProvider";
import { CommunityReportsScreen } from "@/features/communityEvents/ui/CommunityReportsScreen";

export default async function CommunityReportsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <CommunityEventsProvider lang={lang}>
      <CommunityReportsScreen lang={lang} />
    </CommunityEventsProvider>
  );
}
