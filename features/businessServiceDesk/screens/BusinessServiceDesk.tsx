import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import {
  getOperationsDictionary,
  NAMESPACE as OPERATIONS,
} from "@/features/operations/i18n";
import { DictionaryProvider } from "@/i18n/context";
import { getBusinessServiceDeskDictionary, NAMESPACE } from "../i18n";
import { BusinessServiceDeskScreen } from "../ui/BusinessServiceDeskScreen";

// The owner, or anyone with MANAGE_BUSINESS_ORDERS, as ekoru-services
// enforces. The operations texts name the statuses as EKORU's screens do.
export async function BusinessServiceDesk({ lang }: { lang: SupportedLanguage }) {
  const [dict, operations] = await Promise.all([
    getBusinessServiceDeskDictionary(lang),
    getOperationsDictionary(lang),
  ]);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict, [OPERATIONS]: operations }}>
      <PermissionGate
        adminType="BUSINESS"
        permission="MANAGE_BUSINESS_ORDERS"
        fallback={<AccessDenied />}
      >
        <BusinessServiceDeskScreen lang={lang} />
      </PermissionGate>
    </DictionaryProvider>
  );
}
