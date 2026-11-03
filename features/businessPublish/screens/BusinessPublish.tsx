import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { DictionaryProvider } from "@/i18n/context";
import { getBusinessPublishDictionary, NAMESPACE } from "../i18n";
import { BusinessPublishScreen } from "../ui/BusinessPublishScreen";

// The owner holds every business permission; anyone else needs the products
// one, as ekoru-stores and ekoru-services enforce.
export async function BusinessPublish({ lang }: { lang: SupportedLanguage }) {
  const dict = await getBusinessPublishDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <PermissionGate
        adminType="BUSINESS"
        permission="MANAGE_BUSINESS_PRODUCTS"
        fallback={<AccessDenied />}
      >
        <BusinessPublishScreen lang={lang} />
      </PermissionGate>
    </DictionaryProvider>
  );
}
