import { notFound } from "next/navigation";
import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getMembershipsDictionary, NAMESPACE } from "@/features/memberships/i18n";
import { isMembershipKind } from "@/features/memberships/registry";
import { MembershipEditScreen } from "@/features/memberships/ui/MembershipEditScreen";

export default async function EditMembershipPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; kind: string; id: string }>;
}) {
  const { lang, kind, id } = await params;
  if (!isMembershipKind(kind)) notFound();
  const dict = await getMembershipsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <MembershipEditScreen kind={kind} id={Number(id)} lang={lang} />
    </DictionaryProvider>
  );
}
