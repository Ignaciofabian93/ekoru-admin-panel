import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getMarketplaceDictionary, NAMESPACE } from "../i18n";

/** Server wrapper that loads the marketplace dictionary for every catalog route. */
export async function MarketplaceProvider({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: React.ReactNode;
}) {
  const dict = await getMarketplaceDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>{children}</DictionaryProvider>
  );
}
