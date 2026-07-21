import { type SupportedLanguage } from "@/constants/settings";
import { MarketplaceProvider } from "@/features/marketplace/ui/MarketplaceProvider";
import { ProductCategoriesScreen } from "@/features/marketplace/ui/ProductCategoriesScreen";

export default async function ProductCategoriesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <MarketplaceProvider lang={lang}>
      <ProductCategoriesScreen lang={lang} />
    </MarketplaceProvider>
  );
}
