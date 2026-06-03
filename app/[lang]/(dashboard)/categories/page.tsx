import { type SupportedLanguage } from "@/constants/settings";
import { Categories } from "@/features/categories/screens/Categories";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <Categories lang={lang} />;
}
