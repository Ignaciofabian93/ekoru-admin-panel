import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getBlogCommunityDictionary, NAMESPACE } from "../i18n";

/** Server wrapper that loads the blog/community catalog dictionary for its routes. */
export async function BlogCommunityProvider({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: React.ReactNode;
}) {
  const dict = await getBlogCommunityDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>{children}</DictionaryProvider>
  );
}
