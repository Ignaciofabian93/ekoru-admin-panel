import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { Suspense } from "react";

import { getAuthDictionary, NAMESPACE } from "../i18n";
import { AuthShell } from "../ui/AuthShell";
import { SetPasswordForm } from "../ui/SetPasswordForm";

export async function SetPassword({ lang }: { lang: SupportedLanguage }) {
  const dict = await getAuthDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <AuthShell subtitleKey="setPassword.subtitle">
        {/* useSearchParams reads the token. */}
        <Suspense>
          <SetPasswordForm />
        </Suspense>
      </AuthShell>
    </DictionaryProvider>
  );
}
