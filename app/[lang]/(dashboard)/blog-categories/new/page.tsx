import { type SupportedLanguage } from "@/constants/settings";
import { BlogCommunityProvider } from "@/features/blogCommunity/ui/BlogCommunityProvider";
import { BlogCategoryFormScreen } from "@/features/blogCommunity/ui/BlogCategoryFormScreen";

export default async function NewBlogCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <BlogCommunityProvider lang={lang}>
      <BlogCategoryFormScreen lang={lang} />
    </BlogCommunityProvider>
  );
}
