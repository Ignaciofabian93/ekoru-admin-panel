import { type SupportedLanguage } from "@/constants/settings";
import { BlogCommunityProvider } from "@/features/blogCommunity/ui/BlogCommunityProvider";
import { CommunityCategoryFormScreen } from "@/features/blogCommunity/ui/CommunityCategoryFormScreen";

export default async function NewCommunityCategoryPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return (
    <BlogCommunityProvider lang={lang}>
      <CommunityCategoryFormScreen lang={lang} />
    </BlogCommunityProvider>
  );
}
