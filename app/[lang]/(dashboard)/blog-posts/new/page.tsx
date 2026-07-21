import { type SupportedLanguage } from "@/constants/settings";
import { BlogPostsProvider } from "@/features/blogPosts/ui/BlogPostsProvider";
import { BlogPostFormScreen } from "@/features/blogPosts/ui/BlogPostFormScreen";

export default async function NewBlogPostPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <BlogPostsProvider lang={lang}>
      <BlogPostFormScreen lang={lang} />
    </BlogPostsProvider>
  );
}
