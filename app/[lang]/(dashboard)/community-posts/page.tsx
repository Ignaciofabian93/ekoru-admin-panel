import { type SupportedLanguage } from "@/constants/settings";
import { CommunityEventsProvider } from "@/features/communityEvents/ui/CommunityEventsProvider";
import { CommunityEventsScreen } from "@/features/communityEvents/ui/CommunityEventsScreen";

export default async function CommunityPostsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <CommunityEventsProvider lang={lang}>
      <CommunityEventsScreen lang={lang} />
    </CommunityEventsProvider>
  );
}
