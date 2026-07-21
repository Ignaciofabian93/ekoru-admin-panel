import { type SupportedLanguage } from "@/constants/settings";
import { CommunityEventsProvider } from "@/features/communityEvents/ui/CommunityEventsProvider";
import { CommunityEventFormScreen } from "@/features/communityEvents/ui/CommunityEventFormScreen";

export default async function EditCommunityEventPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <CommunityEventsProvider lang={lang}>
      <CommunityEventFormScreen lang={lang} id={Number(id)} />
    </CommunityEventsProvider>
  );
}
