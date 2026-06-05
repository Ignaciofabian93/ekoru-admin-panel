import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getSellerLabelsDictionary, NAMESPACE } from "@/features/seller-labels/i18n";
import { SellerLabelDetailScreen } from "@/features/seller-labels/ui/SellerLabelDetailScreen";

export default async function SellerLabelDetailPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getSellerLabelsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <SellerLabelDetailScreen id={Number(id)} lang={lang} />
    </DictionaryProvider>
  );
}
