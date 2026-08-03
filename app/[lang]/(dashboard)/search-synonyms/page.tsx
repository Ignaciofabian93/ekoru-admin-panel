import { type SupportedLanguage } from "@/constants/settings";
import { SearchConfigProvider } from "@/features/searchConfig/ui/SearchConfigProvider";
import { SearchConfigScreen } from "@/features/searchConfig/ui/SearchConfigScreen";

export default async function SearchSynonymsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <SearchConfigProvider lang={lang}>
      <SearchConfigScreen kind="synonyms" lang={lang} />
    </SearchConfigProvider>
  );
}
