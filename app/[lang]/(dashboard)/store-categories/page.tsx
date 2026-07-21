import { type SupportedLanguage } from "@/constants/settings";
import { StoresProvider } from "@/features/stores/ui/StoresProvider";
import { StoreCategoriesScreen } from "@/features/stores/ui/StoreCategoriesScreen";

export default async function StoreCategoriesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <StoresProvider lang={lang}>
      <StoreCategoriesScreen lang={lang} />
    </StoresProvider>
  );
}
