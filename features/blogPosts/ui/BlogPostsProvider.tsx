import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getBlogPostsDictionary, NAMESPACE } from "../i18n";

/** Server wrapper that loads the blog-posts dictionary for every blog route. */
export async function BlogPostsProvider({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: React.ReactNode;
}) {
  const dict = await getBlogPostsDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>{children}</DictionaryProvider>
  );
}
