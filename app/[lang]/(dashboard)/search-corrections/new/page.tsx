import { type SupportedLanguage } from "@/constants/settings";
import { SearchConfigProvider } from "@/features/searchConfig/ui/SearchConfigProvider";
import { SearchConfigFormScreen } from "@/features/searchConfig/ui/SearchConfigFormScreen";

export default async function NewSearchCorrectionPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <SearchConfigProvider lang={lang}>
      <SearchConfigFormScreen kind="corrections" lang={lang} />
    </SearchConfigProvider>
  );
}
