import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { getAnalyticsDictionary, NAMESPACE } from "../i18n";
import { BusinessProductsScreen } from "../ui/BusinessProductsScreen";
import { BusinessSalesScreen } from "../ui/BusinessSalesScreen";
import { BusinessSearchScreen } from "../ui/BusinessSearchScreen";

/** A business's own figures: its admins with VIEW_BUSINESS_ANALYTICS only. */
async function BusinessAnalyticsPage({
  lang,
  children,
}: {
  lang: SupportedLanguage;
  children: React.ReactNode;
}) {
  const dict = await getAnalyticsDictionary(lang);
  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <PermissionGate
        adminType="BUSINESS"
        permission="VIEW_BUSINESS_ANALYTICS"
        fallback={<AccessDenied />}
      >
        {children}
      </PermissionGate>
    </DictionaryProvider>
  );
}

export function BusinessSales({ lang }: { lang: SupportedLanguage }) {
  return (
    <BusinessAnalyticsPage lang={lang}>
      <BusinessSalesScreen lang={lang} />
    </BusinessAnalyticsPage>
  );
}

export function BusinessProducts({ lang }: { lang: SupportedLanguage }) {
  return (
    <BusinessAnalyticsPage lang={lang}>
      <BusinessProductsScreen lang={lang} />
    </BusinessAnalyticsPage>
  );
}

export function BusinessSearch({ lang }: { lang: SupportedLanguage }) {
  return (
    <BusinessAnalyticsPage lang={lang}>
      <BusinessSearchScreen lang={lang} />
    </BusinessAnalyticsPage>
  );
}
