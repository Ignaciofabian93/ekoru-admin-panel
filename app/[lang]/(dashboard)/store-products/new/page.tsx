import { type SupportedLanguage } from "@/constants/settings";
import { StoreProductsProvider } from "@/features/storeProducts/ui/StoreProductsProvider";
import { StoreProductFormScreen } from "@/features/storeProducts/ui/StoreProductFormScreen";

export default async function NewStoreProductPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <StoreProductsProvider lang={lang}>
      <StoreProductFormScreen lang={lang} />
    </StoreProductsProvider>
  );
}
