import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getUsersDictionary, NAMESPACE } from "../i18n";
import { UsersScreen } from "../ui/UsersScreen";

export async function UsersList({ lang }: { lang: SupportedLanguage }) {
  const dict = await getUsersDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <UsersScreen lang={lang} />
    </DictionaryProvider>
  );
}
