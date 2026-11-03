import { type SupportedLanguage } from "@/constants/settings";
import { SetPassword } from "@/features/auth/screens/SetPassword";

// The invite and reset emails link here with ?token= (USR-15).
export default async function SetPasswordPage({
  params,
}: {
  params: Promise<{ lang: SupportedLanguage }>;
}) {
  const { lang } = await params;
  return <SetPassword lang={lang} />;
}
