import { type SupportedLanguage } from "@/constants/settings";
import { StoresProvider } from "@/features/stores/ui/StoresProvider";
import { StoreSubCategoryFormScreen } from "@/features/stores/ui/StoreSubCategoryFormScreen";

export default async function NewStoreSubCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <StoresProvider lang={lang}>
      <StoreSubCategoryFormScreen lang={lang} />
    </StoresProvider>
  );
}
