import { type SupportedLanguage } from "@/constants/settings";
import { Blog } from "@/features/blog/screens/Blog";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <Blog lang={lang} />;
}
