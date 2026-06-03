import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { ScaffoldScreen } from "@/components/ScaffoldScreen/ScaffoldScreen";
import { DictionaryProvider } from "@/i18n/context";
import { getCategoriesDictionary, NAMESPACE } from "../i18n";

export async function Categories({ lang }: { lang: SupportedLanguage }) {
  const dict = await getCategoriesDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <PermissionGate
        adminType="PLATFORM"
        permission="MANAGE_CATEGORIES"
        fallback={<AccessDenied />}
      >
        <ScaffoldScreen namespace={NAMESPACE} />
      </PermissionGate>
    </DictionaryProvider>
  );
}
