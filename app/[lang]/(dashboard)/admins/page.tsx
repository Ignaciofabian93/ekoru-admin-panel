import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getAdminsDictionary, NAMESPACE } from "@/features/admins/i18n";
import { AdminsScreen } from "@/features/admins/ui/AdminsScreen";

export default async function AdminsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  const dict = await getAdminsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <AdminsScreen lang={lang} />
    </DictionaryProvider>
  );
}
