import { type SupportedLanguage } from "@/constants/settings";
import { BlogCommunityProvider } from "@/features/blogCommunity/ui/BlogCommunityProvider";
import { CommunitySubCategoriesScreen } from "@/features/blogCommunity/ui/CommunitySubCategoriesScreen";

export default async function CommunitySubCategoriesPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <BlogCommunityProvider lang={lang}>
      <CommunitySubCategoriesScreen lang={lang} />
    </BlogCommunityProvider>
  );
}
