import { type SupportedLanguage } from "@/constants/settings";
import { Login } from "@/features/auth/screens/Login";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <Login lang={lang} />;
}
