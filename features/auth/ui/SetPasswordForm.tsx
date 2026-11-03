"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { Lock } from "lucide-react";
import MainButton from "@/components/Button/MainButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { DEFAULT_LANGUAGE, type SupportedLanguage } from "@/constants/settings";
import { SET_ADMIN_PASSWORD } from "@/graphql/admin/password";
import { useGqlLanguage } from "@/hooks/useGqlLanguage";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { isMinLength } from "@/utils/inputValidations";

/**
 * Where the invite and reset emails land (USR-15): `?token=` is the one-time
 * link. A new business owner or team member chooses their first password
 * here; anyone else, a new one.
 */
export function SetPasswordForm() {
  const { t } = useTranslation("auth");
  const toast = useToast();
  const language = useGqlLanguage();
  const { navigateTo } = useNavigation();
  const params = useParams<{ lang?: SupportedLanguage }>();
  const lang = params.lang ?? DEFAULT_LANGUAGE;
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [save, { loading }] = useMutation(SET_ADMIN_PASSWORD);

  const valid = isMinLength(password, 8) && password === confirm;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!valid) return;
    try {
      await save({ variables: { token, newPassword: password, language } });
      setDone(true);
    } catch (error) {
      // The server says why: an expired or used link, or a short password.
      toast.error(error instanceof Error ? error.message : t("feedback.networkError"));
    }
  };

  const loginLink = (key: "goToLogin" | "forgot") => (
    <Link
      href={key === "forgot" ? `/${lang}/forgot-password` : `/${lang}/login`}
      className="text-center text-sm font-semibold text-primary hover:underline"
    >
      {t(`actions.${key}`)}
    </Link>
  );

  if (!token) {
    return (
      <div className="flex flex-col gap-5">
        <Text variant="p" color="secondary" align="center">
          {t("setPassword.noToken")}
        </Text>
        {loginLink("forgot")}
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col gap-5">
        <Text variant="p" color="secondary" align="center">
          {t("setPassword.done")}
        </Text>
        <MainButton
          text={t("actions.goToLogin")}
          fullWidth
          size="md"
          onPress={() => navigateTo({ route: `/${lang}/login` })}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        name="password"
        label={t("setPassword.newPassword")}
        placeholder={t("form.passwordPlaceholder")}
        type="password"
        value={password}
        onChangeText={setPassword}
        leftIcon={Lock}
        autoComplete="new-password"
        required
        errorMessage={t("feedback.passwordError")}
        isInvalid={password.length > 0 && !isMinLength(password, 8)}
      />
      <Input
        name="confirm"
        label={t("setPassword.confirm")}
        placeholder={t("form.passwordPlaceholder")}
        type="password"
        value={confirm}
        onChangeText={setConfirm}
        leftIcon={Lock}
        autoComplete="new-password"
        required
        errorMessage={t("setPassword.mismatch")}
        isInvalid={confirm.length > 0 && confirm !== password}
      />
      <MainButton
        text={t("actions.savePassword")}
        type="submit"
        loading={loading}
        disabled={!valid}
        fullWidth
        size="md"
      />
      {loginLink("forgot")}
    </form>
  );
}
