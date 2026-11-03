import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";

import { getAuthDictionary, NAMESPACE } from "../i18n";
import { AuthShell } from "../ui/AuthShell";
import { ForgotPasswordForm } from "../ui/ForgotPasswordForm";

export async function ForgotPassword({ lang }: { lang: SupportedLanguage }) {
  const dict = await getAuthDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <AuthShell subtitleKey="forgot.subtitle">
        <ForgotPasswordForm />
      </AuthShell>
    </DictionaryProvider>
  );
}
