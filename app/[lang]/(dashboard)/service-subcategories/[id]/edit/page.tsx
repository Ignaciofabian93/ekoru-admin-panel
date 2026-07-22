import { type SupportedLanguage } from "@/constants/settings";
import { ServiceCatalogProvider } from "@/features/serviceCatalog/ui/ServiceCatalogProvider";
import { ServiceSubCategoryFormScreen } from "@/features/serviceCatalog/ui/ServiceSubCategoryFormScreen";

export default async function EditServiceSubCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <ServiceCatalogProvider lang={lang}>
      <ServiceSubCategoryFormScreen lang={lang} id={Number(id)} />
    </ServiceCatalogProvider>
  );
}
