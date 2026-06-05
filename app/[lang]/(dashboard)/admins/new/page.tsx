import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getAdminsDictionary, NAMESPACE } from "@/features/admins/i18n";
import { AdminForm } from "@/features/admins/ui/AdminForm";

export default async function NewAdminPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  const dict = await getAdminsDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <AdminForm mode="create" lang={lang} />
    </DictionaryProvider>
  );
}
