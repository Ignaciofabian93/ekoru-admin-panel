import { type SupportedLanguage } from "@/constants/settings";
import { BlogPostsProvider } from "@/features/blogPosts/ui/BlogPostsProvider";
import { BlogPostFormScreen } from "@/features/blogPosts/ui/BlogPostFormScreen";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <BlogPostsProvider lang={lang}>
      <BlogPostFormScreen lang={lang} id={Number(id)} />
    </BlogPostsProvider>
  );
}
