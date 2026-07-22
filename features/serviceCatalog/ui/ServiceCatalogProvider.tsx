import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getServiceCatalogDictionary, NAMESPACE } from "../i18n";

/** Server wrapper that loads the service-catalog dictionary for its routes. */
export async function ServiceCatalogProvider({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: React.ReactNode;
}) {
  const dict = await getServiceCatalogDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>{children}</DictionaryProvider>
  );
}
