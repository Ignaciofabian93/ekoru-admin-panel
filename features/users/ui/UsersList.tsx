import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getUsersDictionary, NAMESPACE } from "../i18n";
import { UsersList } from "../screens/UsersScreen";

export async function UsersScreen({ lang }: { lang: SupportedLanguage }) {
  const dict = await getUsersDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <UsersList lang={lang} />
    </DictionaryProvider>
  );
}
