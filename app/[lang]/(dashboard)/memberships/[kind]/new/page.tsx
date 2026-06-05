import { notFound } from "next/navigation";
import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getMembershipsDictionary, NAMESPACE } from "@/features/memberships/i18n";
import { isMembershipKind } from "@/features/memberships/registry";
import { MembershipForm } from "@/features/memberships/ui/MembershipForm";

export default async function NewMembershipPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; kind: string }>;
}) {
  const { lang, kind } = await params;
  if (!isMembershipKind(kind)) notFound();
  const dict = await getMembershipsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <MembershipForm kind={kind} mode="create" lang={lang} />
    </DictionaryProvider>
  );
}
