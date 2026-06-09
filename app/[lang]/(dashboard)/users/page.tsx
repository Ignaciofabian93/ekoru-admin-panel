import { type SupportedLanguage } from "@/constants/settings";
import { UsersScreen } from "@/features/users/ui/UsersList";

export default async function UsersPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <UsersScreen lang={lang} />;
}
