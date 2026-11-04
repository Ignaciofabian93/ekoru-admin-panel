import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import {
  getOperationsDictionary,
  NAMESPACE as OPERATIONS,
} from "@/features/operations/i18n";
import { DictionaryProvider } from "@/i18n/context";
import { getBusinessOrdersDictionary, NAMESPACE } from "../i18n";
import { BusinessOrderDetailScreen } from "../ui/BusinessOrderDetailScreen";
import { BusinessOrdersScreen } from "../ui/BusinessOrdersScreen";

/**
 * The store's orders, for the owner or anyone with MANAGE_BUSINESS_ORDERS, as
 * ekoru-transactions enforces. The operations texts name the statuses and
 * shipping methods the same way EKORU's own screens do.
 */
export async function BusinessOrders({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  /** An order's id opens that order; without it, the list. */
  id?: string;
}) {
  const [dict, operations] = await Promise.all([
    getBusinessOrdersDictionary(lang),
    getOperationsDictionary(lang),
  ]);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict, [OPERATIONS]: operations }}>
      <PermissionGate
        adminType="BUSINESS"
        permission="MANAGE_BUSINESS_ORDERS"
        fallback={<AccessDenied />}
      >
        {id ? (
          <BusinessOrderDetailScreen id={id} lang={lang} />
        ) : (
          <BusinessOrdersScreen lang={lang} />
        )}
      </PermissionGate>
    </DictionaryProvider>
  );
}
