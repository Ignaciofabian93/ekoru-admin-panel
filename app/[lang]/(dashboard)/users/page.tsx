import { type SupportedLanguage } from "@/constants/settings";
import { UsersList } from "@/features/users/screens/UsersList";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <UsersList lang={lang} />;
}
