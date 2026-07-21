import { type SupportedLanguage } from "@/constants/settings";
import { BlogCommunityProvider } from "@/features/blogCommunity/ui/BlogCommunityProvider";
import { CommunityCategoryFormScreen } from "@/features/blogCommunity/ui/CommunityCategoryFormScreen";

export default async function EditCommunityCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <BlogCommunityProvider lang={lang}>
      <CommunityCategoryFormScreen lang={lang} id={Number(id)} />
    </BlogCommunityProvider>
  );
}
