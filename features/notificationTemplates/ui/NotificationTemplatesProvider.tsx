import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getNotificationTemplatesDictionary, NAMESPACE } from "../i18n";

/** Server wrapper that loads the notification-templates dictionary. */
export async function NotificationTemplatesProvider({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: React.ReactNode;
}) {
  const dict = await getNotificationTemplatesDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>{children}</DictionaryProvider>
  );
}
