import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getSellerLevelsDictionary, NAMESPACE } from "@/features/seller-levels/i18n";
import { SellerLevelsScreen } from "@/features/seller-levels/ui/SellerLevelsScreen";

export default async function SellerLevelsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  const dict = await getSellerLevelsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <SellerLevelsScreen lang={lang} />
    </DictionaryProvider>
  );
}
