import { type SupportedLanguage } from "@/constants/settings";
import { SearchConfigProvider } from "@/features/searchConfig/ui/SearchConfigProvider";
import { SearchConfigFormScreen } from "@/features/searchConfig/ui/SearchConfigFormScreen";

export default async function EditSearchSuggestionPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <SearchConfigProvider lang={lang}>
      <SearchConfigFormScreen kind="suggestions" lang={lang} id={Number(id)} />
    </SearchConfigProvider>
  );
}
