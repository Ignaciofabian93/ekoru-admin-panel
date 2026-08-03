import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getTransactionConfigDictionary, NAMESPACE } from "../i18n";

/** Server wrapper that loads the transaction-config dictionary for its routes. */
export async function TransactionConfigProvider({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: React.ReactNode;
}) {
  const dict = await getTransactionConfigDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>{children}</DictionaryProvider>
  );
}
