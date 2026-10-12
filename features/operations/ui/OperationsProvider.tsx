import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getOperationsDictionary, NAMESPACE } from "../i18n";

/** Server wrapper that loads the operations dictionary (orders, payments, deals, bookings, quotations). */
export async function OperationsProvider({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: React.ReactNode;
}) {
  const dict = await getOperationsDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>{children}</DictionaryProvider>
  );
}
