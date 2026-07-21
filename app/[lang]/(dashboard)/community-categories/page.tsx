import { type SupportedLanguage } from "@/constants/settings";
import { BlogCommunityProvider } from "@/features/blogCommunity/ui/BlogCommunityProvider";
import { CommunityCategoriesScreen } from "@/features/blogCommunity/ui/CommunityCategoriesScreen";

export default async function CommunityCategoriesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <BlogCommunityProvider lang={lang}>
      <CommunityCategoriesScreen lang={lang} />
    </BlogCommunityProvider>
  );
}
