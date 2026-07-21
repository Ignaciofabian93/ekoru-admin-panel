import { type SupportedLanguage } from "@/constants/settings";
import { BlogCommunityProvider } from "@/features/blogCommunity/ui/BlogCommunityProvider";
import { BlogCategoriesScreen } from "@/features/blogCommunity/ui/BlogCategoriesScreen";

export default async function BlogCategoriesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <BlogCommunityProvider lang={lang}>
      <BlogCategoriesScreen lang={lang} />
    </BlogCommunityProvider>
  );
}
