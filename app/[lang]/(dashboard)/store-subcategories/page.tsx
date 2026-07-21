import { type SupportedLanguage } from "@/constants/settings";
import { StoresProvider } from "@/features/stores/ui/StoresProvider";
import { StoreSubCategoriesScreen } from "@/features/stores/ui/StoreSubCategoriesScreen";

export default async function StoreSubCategoriesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <StoresProvider lang={lang}>
      <StoreSubCategoriesScreen lang={lang} />
    </StoresProvider>
  );
}
