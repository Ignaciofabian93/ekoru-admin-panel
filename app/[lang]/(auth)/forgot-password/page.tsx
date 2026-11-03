import { type SupportedLanguage } from "@/constants/settings";
import { ForgotPassword } from "@/features/auth/screens/ForgotPassword";

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <ForgotPassword lang={lang} />;
}
