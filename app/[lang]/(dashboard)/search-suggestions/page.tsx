import { type SupportedLanguage } from "@/constants/settings";
import { SearchConfigProvider } from "@/features/searchConfig/ui/SearchConfigProvider";
import { SearchConfigScreen } from "@/features/searchConfig/ui/SearchConfigScreen";

export default async function SearchSuggestionsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <SearchConfigProvider lang={lang}>
      <SearchConfigScreen kind="suggestions" lang={lang} />
    </SearchConfigProvider>
  );
}
