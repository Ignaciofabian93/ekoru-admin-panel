import { type SupportedLanguage } from "@/constants/settings";
import { DictionaryProvider } from "@/i18n/context";
import { Suspense } from "react";

import { getAuthDictionary, NAMESPACE } from "../i18n";
import { AuthShell } from "../ui/AuthShell";
import { LoginForm } from "../ui/LoginForm";

export async function Login({ lang }: { lang: SupportedLanguage }) {
  const dict = await getAuthDictionary(lang);

  return (
    <DictionaryProvider dictionary={{ [NAMESPACE]: dict }}>
      <AuthShell>
        <Suspense>
          <LoginForm />
        </Suspense>
      </AuthShell>
    </DictionaryProvider>
  );
}
