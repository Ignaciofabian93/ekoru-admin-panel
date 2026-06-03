import { type SupportedLanguage } from "@/constants/settings";
import { MyBusiness } from "@/features/my-business/screens/MyBusiness";

export default async function MyBusinessPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <MyBusiness lang={lang} />;
}
