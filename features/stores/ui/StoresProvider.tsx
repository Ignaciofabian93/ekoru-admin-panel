import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getStoresDictionary, NAMESPACE } from "../i18n";

/** Server wrapper that loads the stores dictionary for every store catalog route. */
export async function StoresProvider({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: React.ReactNode;
}) {
  const dict = await getStoresDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>{children}</DictionaryProvider>
  );
}
