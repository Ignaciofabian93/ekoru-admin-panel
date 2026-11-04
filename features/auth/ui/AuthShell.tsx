"use client";
import { Logo } from "@/components/Logo/Logo";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation("auth");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background-secondary px-6 py-10">
      <section
        aria-label={t("a11y.authSection")}
        className="w-full max-w-md animate-fade-up rounded-2xl border border-border-light bg-surface p-8 shadow-lg"
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo />
          <Title
            level="h1"
            size="h5"
            weight="semibold"
            color="primary"
            align="center"
            className="mt-2"
          >
            {t("page.headline")}
          </Title>
        </div>

        {children}
      </section>
    </main>
  );
}
