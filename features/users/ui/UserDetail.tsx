import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getUsersDictionary, NAMESPACE } from "../i18n";
import { UserDetailScreen } from "../ui/UserDetailScreen";

export async function UserDetail({ id, lang }: { id: string; lang: SupportedLanguage }) {
  const dict = await getUsersDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <UserDetailScreen id={id} lang={lang} />
    </DictionaryProvider>
  );
}
