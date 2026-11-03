"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { Mail } from "lucide-react";
import MainButton from "@/components/Button/MainButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { DEFAULT_LANGUAGE, type SupportedLanguage } from "@/constants/settings";
import { REQUEST_ADMIN_PASSWORD_RESET } from "@/graphql/admin/password";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { isValidEmail } from "@/utils/inputValidations";

/**
 * The panel's "forgot password" (USR-15): emails a one-time link to choose a
 * new password. The answer is the same whatever the address, so it never
 * tells whether an account exists.
 */
export function ForgotPasswordForm() {
  const { t } = useTranslation("auth");
  const toast = useToast();
  const language = useGqlLanguage();
  const params = useParams<{ lang?: SupportedLanguage }>();
  const lang = params.lang ?? DEFAULT_LANGUAGE;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [request, { loading }] = useMutation(REQUEST_ADMIN_PASSWORD_RESET);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidEmail(email)) return;
    try {
      await request({ variables: { email: email.trim().toLowerCase(), language } });
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("feedback.networkError"));
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col gap-5">
        <Text variant="p" color="secondary" align="center">
          {t("forgot.sent")}
        </Text>
        <Link
          href={`/${lang}/login`}
          className="text-center text-sm font-semibold text-primary hover:underline"
        >
          {t("actions.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        name="email"
        label={t("form.email")}
        placeholder={t("form.emailPlaceholder")}
        type="email"
        value={email}
        onChangeText={setEmail}
        leftIcon={Mail}
        autoComplete="email"
        required
        errorMessage={t("feedback.emailError")}
        isInvalid={email.length > 0 && !isValidEmail(email)}
      />
      <MainButton
        text={t("actions.sendLink")}
        type="submit"
        loading={loading}
        fullWidth
        size="md"
      />
      <Link
        href={`/${lang}/login`}
        className="text-center text-sm font-semibold text-primary hover:underline"
      >
        {t("actions.backToLogin")}
      </Link>
    </form>
  );
}
