import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getMembershipsDictionary, NAMESPACE } from "@/features/memberships/i18n";
import { MembershipsScreen } from "@/features/memberships/ui/MembershipsScreen";

export default async function MembershipsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  const dict = await getMembershipsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <MembershipsScreen lang={lang} />
    </DictionaryProvider>
  );
}
