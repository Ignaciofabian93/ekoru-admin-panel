import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getAdminsDictionary, NAMESPACE } from "@/features/admins/i18n";
import { AdminDetailScreen } from "@/features/admins/ui/AdminDetailScreen";

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getAdminsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <AdminDetailScreen id={id} lang={lang} />
    </DictionaryProvider>
  );
}
