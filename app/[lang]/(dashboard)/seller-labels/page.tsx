import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getSellerLabelsDictionary, NAMESPACE } from "@/features/seller-labels/i18n";
import { SellerLabelsScreen } from "@/features/seller-labels/ui/SellerLabelsScreen";

export default async function SellerLabelsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  const dict = await getSellerLabelsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <SellerLabelsScreen lang={lang} />
    </DictionaryProvider>
  );
}
