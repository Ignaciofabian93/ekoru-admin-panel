import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getSellerLabelsDictionary, NAMESPACE } from "@/features/seller-labels/i18n";
import { SellerLabelEditScreen } from "@/features/seller-labels/ui/SellerLabelEditScreen";

export default async function EditSellerLabelPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getSellerLabelsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <SellerLabelEditScreen id={Number(id)} lang={lang} />
    </DictionaryProvider>
  );
}
