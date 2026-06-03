import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { ScaffoldScreen } from "@/components/ScaffoldScreen/ScaffoldScreen";
import { DictionaryProvider } from "@/i18n/context";
import { getCommunityDictionary, NAMESPACE } from "../i18n";

export async function Community({ lang }: { lang: SupportedLanguage }) {
  const dict = await getCommunityDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <PermissionGate
        adminType="PLATFORM"
        permission="MODERATE_CONTENT"
        fallback={<AccessDenied />}
      >
        <ScaffoldScreen namespace={NAMESPACE} />
      </PermissionGate>
    </DictionaryProvider>
  );
}
