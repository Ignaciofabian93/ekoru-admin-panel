import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getSellerLevelsDictionary, NAMESPACE } from "@/features/seller-levels/i18n";
import { SellerLevelEditScreen } from "@/features/seller-levels/ui/SellerLevelEditScreen";

export default async function EditSellerLevelPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getSellerLevelsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <SellerLevelEditScreen id={Number(id)} lang={lang} />
    </DictionaryProvider>
  );
}
