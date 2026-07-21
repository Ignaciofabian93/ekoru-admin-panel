import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getCommunityEventsDictionary, NAMESPACE } from "../i18n";

/** Server wrapper that loads the community-events dictionary for every event route. */
export async function CommunityEventsProvider({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: React.ReactNode;
}) {
  const dict = await getCommunityEventsDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>{children}</DictionaryProvider>
  );
}
