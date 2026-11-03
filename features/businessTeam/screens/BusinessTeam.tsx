import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { DictionaryProvider } from "@/i18n/context";
import { getBusinessTeamDictionary, NAMESPACE } from "../i18n";
import { BusinessTeamScreen } from "../ui/BusinessTeamScreen";

// The owner holds every business permission; anyone else needs the team one,
// as ekoru-users enforces.
export async function BusinessTeam({ lang }: { lang: SupportedLanguage }) {
  const dict = await getBusinessTeamDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <PermissionGate
        adminType="BUSINESS"
        permission="MANAGE_BUSINESS_TEAM"
        fallback={<AccessDenied />}
      >
        <BusinessTeamScreen lang={lang} />
      </PermissionGate>
    </DictionaryProvider>
  );
}
