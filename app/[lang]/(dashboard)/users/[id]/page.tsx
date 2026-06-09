import { type SupportedLanguage } from "@/constants/settings";
import { UserDetail } from "@/features/users/ui/UserDetail";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage; id: string }>;
}) {
  const { lang, id } = await params;
  return <UserDetail id={id} lang={lang} />;
}
