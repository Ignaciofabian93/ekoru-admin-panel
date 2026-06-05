"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import MainButton from "@/components/Button/MainButton";
import { IconButton } from "@/components/IconButton/IconButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { Textarea } from "@/components/Textarea/Textarea";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { BACKEND_LANGUAGES, type BackendLanguage } from "@/utils/language";
import { useMembershipMutations } from "../hooks/useMembershipMutations";
import { useMembershipTranslations } from "../hooks/useMemberships";
import type { MembershipKind, MembershipTranslation } from "../types";

function TranslationRow({
  kind,
  code,
  existing,
  membershipId,
  onChanged,
}: {
  kind: MembershipKind;
  code: BackendLanguage;
  existing: MembershipTranslation | null;
  membershipId: number;
  onChanged: () => void;
}) {
  const { t } = useTranslation("memberships");
  const { upsertTranslation, deleteTranslation, loading } = useMembershipMutations(kind);
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(
    (existing?.description ?? []).join("\n"),
  );

  const save = async () => {
    if (!name.trim()) return;
    const desc = description
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const ok = await upsertTranslation(membershipId, {
      language: code,
      name: name.trim(),
      description: desc,
    });
    if (ok) onChanged();
  };

  const remove = async () => {
    if (!window.confirm(t("translations.deleteConfirm"))) return;
    const ok = await deleteTranslation(membershipId, code);
    if (ok) onChanged();
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border-light p-3">
      <div className="flex items-center justify-between">
        <Text variant="small" color="tertiary" weight="semibold">
          {t(`language.${code}`)}
        </Text>
        {existing && (
          <IconButton
            icon={Trash2}
            tone="danger"
            label={t("translations.delete")}
            disabled={loading}
            onClick={remove}
          />
        )}
      </div>
      <Input
        name={`tr-name-${code}`}
        label={t("translations.name")}
        value={name}
        onChangeText={setName}
      />
      <Textarea
        name={`tr-desc-${code}`}
        label={t("translations.description")}
        value={description}
        onChangeText={setDescription}
        rows={4}
      />
      <div className="flex justify-end">
        <MainButton
          text={t("translations.save")}
          size="sm"
          loading={loading}
          onPress={save}
        />
      </div>
    </div>
  );
}

export function MembershipTranslations({
  kind,
  membershipId,
}: {
  kind: MembershipKind;
  membershipId: number;
}) {
  const { t } = useTranslation("memberships");
  const { translations, refetch } = useMembershipTranslations(kind, membershipId);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <Title level="h2" size="h6" weight="semibold">
        {t("translations.title")}
      </Title>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {BACKEND_LANGUAGES.map((code) => {
          const existing = translations[code];
          return (
            <TranslationRow
              key={`${code}-${existing?.name ?? ""}-${(existing?.description ?? []).join("|")}`}
              kind={kind}
              code={code}
              existing={existing}
              membershipId={membershipId}
              onChanged={() => refetch()}
            />
          );
        })}
      </div>
    </section>
  );
}
