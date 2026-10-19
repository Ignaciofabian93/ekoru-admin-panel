import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { DictionaryProvider } from "@/i18n/context";
import { getPaymentSetupDictionary, NAMESPACE } from "../i18n";
import { PaymentSetupScreen } from "../ui/PaymentSetupScreen";

// Any admin of the business may look; the screen itself only offers changes
// to the owner or a MANAGE_BUSINESS_PROFILE holder, as the backend enforces.
export async function PaymentSetup({ lang }: { lang: SupportedLanguage }) {
  const dict = await getPaymentSetupDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <PermissionGate adminType="BUSINESS" fallback={<AccessDenied />}>
        <PaymentSetupScreen lang={lang} />
      </PermissionGate>
    </DictionaryProvider>
  );
}
