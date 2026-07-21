import { type SupportedLanguage } from "@/constants/settings";
import { BlogCommunityProvider } from "@/features/blogCommunity/ui/BlogCommunityProvider";
import { CommunitySubCategoryFormScreen } from "@/features/blogCommunity/ui/CommunitySubCategoryFormScreen";

export default async function NewCommunitySubCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <BlogCommunityProvider lang={lang}>
      <CommunitySubCategoryFormScreen lang={lang} />
    </BlogCommunityProvider>
  );
}
