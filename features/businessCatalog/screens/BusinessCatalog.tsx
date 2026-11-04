import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { DictionaryProvider } from "@/i18n/context";
import { getBusinessCatalogDictionary, NAMESPACE } from "../i18n";
import { CATALOG_FILTERS, type CatalogFilter } from "../types";
import { BusinessCatalogScreen } from "../ui/BusinessCatalogScreen";

// The owner holds every business permission; anyone else needs the products
// one, as the gateway and the subgraphs enforce.
export async function BusinessCatalog({
  lang,
  filter,
}: {
  lang: SupportedLanguage;
  filter?: string;
}) {
  const dict = await getBusinessCatalogDictionary(lang);
  const initialFilter = CATALOG_FILTERS.includes(filter as CatalogFilter)
    ? (filter as CatalogFilter)
    : "all";

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <PermissionGate
        adminType="BUSINESS"
        permission="MANAGE_BUSINESS_PRODUCTS"
        fallback={<AccessDenied />}
      >
        <BusinessCatalogScreen lang={lang} initialFilter={initialFilter} />
      </PermissionGate>
    </DictionaryProvider>
  );
}
