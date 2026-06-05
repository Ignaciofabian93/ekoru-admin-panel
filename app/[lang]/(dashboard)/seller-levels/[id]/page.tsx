import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getSellerLevelsDictionary, NAMESPACE } from "@/features/seller-levels/i18n";
import { SellerLevelDetailScreen } from "@/features/seller-levels/ui/SellerLevelDetailScreen";

export default async function SellerLevelDetailPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getSellerLevelsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <SellerLevelDetailScreen id={Number(id)} lang={lang} />
    </DictionaryProvider>
  );
}
