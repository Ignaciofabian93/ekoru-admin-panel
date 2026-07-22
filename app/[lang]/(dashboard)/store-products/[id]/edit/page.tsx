import { type SupportedLanguage } from "@/constants/settings";
import { StoreProductsProvider } from "@/features/storeProducts/ui/StoreProductsProvider";
import { StoreProductFormScreen } from "@/features/storeProducts/ui/StoreProductFormScreen";

export default async function EditStoreProductPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <StoreProductsProvider lang={lang}>
      <StoreProductFormScreen lang={lang} id={Number(id)} />
    </StoreProductsProvider>
  );
}
