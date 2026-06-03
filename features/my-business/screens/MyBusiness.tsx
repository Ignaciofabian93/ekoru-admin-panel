import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { ScaffoldScreen } from "@/components/ScaffoldScreen/ScaffoldScreen";
import { DictionaryProvider } from "@/i18n/context";
import { getMyBusinessDictionary, NAMESPACE } from "../i18n";

export async function MyBusiness({ lang }: { lang: SupportedLanguage }) {
  const dict = await getMyBusinessDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <PermissionGate
        adminType="BUSINESS"
        permission="MANAGE_BUSINESS_PROFILE"
        fallback={<AccessDenied />}
      >
        <ScaffoldScreen namespace={NAMESPACE} />
      </PermissionGate>
    </DictionaryProvider>
  );
}
