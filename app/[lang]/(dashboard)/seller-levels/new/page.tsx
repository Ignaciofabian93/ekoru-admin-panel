import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getSellerLevelsDictionary, NAMESPACE } from "@/features/seller-levels/i18n";
import { SellerLevelForm } from "@/features/seller-levels/ui/SellerLevelForm";

export default async function NewSellerLevelPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  const dict = await getSellerLevelsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <SellerLevelForm mode="create" lang={lang} />
    </DictionaryProvider>
  );
}
