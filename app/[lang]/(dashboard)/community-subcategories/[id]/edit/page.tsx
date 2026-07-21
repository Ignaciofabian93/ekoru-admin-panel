import { type SupportedLanguage } from "@/constants/settings";
import { BlogCommunityProvider } from "@/features/blogCommunity/ui/BlogCommunityProvider";
import { CommunitySubCategoryFormScreen } from "@/features/blogCommunity/ui/CommunitySubCategoryFormScreen";

export default async function EditCommunitySubCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return (
    <BlogCommunityProvider lang={lang}>
      <CommunitySubCategoryFormScreen lang={lang} id={Number(id)} />
    </BlogCommunityProvider>
  );
}
