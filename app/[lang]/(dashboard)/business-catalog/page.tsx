import { type SupportedLanguage } from "@/constants/settings";
import { BusinessCatalog } from "@/features/businessCatalog/screens/BusinessCatalog";

export default async function BusinessCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { lang } = await params;
  const { filter } = await searchParams;
  return <BusinessCatalog lang={lang} filter={filter} />;
}
