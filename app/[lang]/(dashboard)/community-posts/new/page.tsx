import { type SupportedLanguage } from "@/constants/settings";
import { CommunityEventsProvider } from "@/features/communityEvents/ui/CommunityEventsProvider";
import { CommunityEventFormScreen } from "@/features/communityEvents/ui/CommunityEventFormScreen";

export default async function NewCommunityEventPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <CommunityEventsProvider lang={lang}>
      <CommunityEventFormScreen lang={lang} />
    </CommunityEventsProvider>
  );
}
