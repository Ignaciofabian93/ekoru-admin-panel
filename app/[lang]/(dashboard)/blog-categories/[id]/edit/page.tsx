import { type SupportedLanguage } from "@/constants/settings";
import { BlogCommunityProvider } from "@/features/blogCommunity/ui/BlogCommunityProvider";
import { BlogCategoryFormScreen } from "@/features/blogCommunity/ui/BlogCategoryFormScreen";

export default async function EditBlogCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <BlogCommunityProvider lang={lang}>
      <BlogCategoryFormScreen lang={lang} id={Number(id)} />
    </BlogCommunityProvider>
  );
}
