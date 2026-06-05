import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getSellerLabelsDictionary, NAMESPACE } from "@/features/seller-labels/i18n";
import { SellerLabelForm } from "@/features/seller-labels/ui/SellerLabelForm";

export default async function NewSellerLabelPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  const dict = await getSellerLabelsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <SellerLabelForm mode="create" lang={lang} />
    </DictionaryProvider>
  );
}
