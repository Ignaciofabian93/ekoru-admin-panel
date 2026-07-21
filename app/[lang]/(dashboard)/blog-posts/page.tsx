import { type SupportedLanguage } from "@/constants/settings";
import { BlogPostsProvider } from "@/features/blogPosts/ui/BlogPostsProvider";
import { BlogPostsScreen } from "@/features/blogPosts/ui/BlogPostsScreen";

export default async function BlogPostsPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <BlogPostsProvider lang={lang}>
      <BlogPostsScreen lang={lang} />
    </BlogPostsProvider>
  );
}
