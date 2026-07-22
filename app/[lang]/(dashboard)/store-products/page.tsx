import { type SupportedLanguage } from "@/constants/settings";
import { StoreProductsProvider } from "@/features/storeProducts/ui/StoreProductsProvider";
import { StoreProductsScreen } from "@/features/storeProducts/ui/StoreProductsScreen";

export default async function StoreProductsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <StoreProductsProvider lang={lang}>
      <StoreProductsScreen lang={lang} />
    </StoreProductsProvider>
  );
}
