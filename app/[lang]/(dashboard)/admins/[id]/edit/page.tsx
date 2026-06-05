import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getAdminsDictionary, NAMESPACE } from "@/features/admins/i18n";
import { AdminEditScreen } from "@/features/admins/ui/AdminEditScreen";

export default async function EditAdminPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  const dict = await getAdminsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <AdminEditScreen id={id} lang={lang} />
    </DictionaryProvider>
  );
}
