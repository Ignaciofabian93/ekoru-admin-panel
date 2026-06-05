"use client";

import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { FormShell } from "@/components/FormShell/FormShell";
import Input from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Select } from "@/components/Select/Select";
import { Textarea } from "@/components/Textarea/Textarea";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import type { SellerLabel } from "@/types/account";
import type { TransactionKind } from "@/types/enums";
import { TRANSACTION_KINDS } from "../constants";
import { useSellerLabelMutations } from "../hooks/useSellerLabelMutations";

export function SellerLabelForm({
  mode,
  lang,
  label,
}: {
  mode: "create" | "edit";
  lang: SupportedLanguage;
  label?: SellerLabel;
}) {
  const { t } = useTranslation("sellerLabels");
  const { navigateTo } = useNavigation();
  const { createLabel, updateLabel, loading } = useSellerLabelMutations();

  const [labelName, setLabelName] = useState(label?.labelName ?? "");
  const [transactionKind, setTransactionKind] = useState<TransactionKind>(
    label?.transactionKind ?? "PURCHASE",
  );
  const [transactionsRequired, setTransactionsRequired] = useState(
    label ? String(label.transactionsRequired) : "1",
  );
  const [description, setDescription] = useState(label?.description ?? "");
  const [badgeIcon, setBadgeIcon] = useState(label?.badgeIcon ?? "");

  const backHref =
    mode === "edit" && label
      ? `/${lang}/seller-labels/${label.id}`
      : `/${lang}/seller-labels`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      labelName,
      transactionKind,
      transactionsRequired: Number(transactionsRequired) || 0,
      description: description.trim() || undefined,
      badgeIcon: badgeIcon.trim() || undefined,
    };
    if (mode === "create") {
      const ok = await createLabel(input);
      if (ok) navigateTo({ route: `/${lang}/seller-labels` });
    } else if (label) {
      const ok = await updateLabel(label.id, input);
      if (ok) navigateTo({ route: `/${lang}/seller-labels/${label.id}` });
    }
  };

  const kindOptions = TRANSACTION_KINDS.map((k) => ({
    value: k,
    label: t(`transactionKind.${k}`),
  }));

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      <FormShell
        backHref={backHref}
        backLabel={t("detail.back")}
        title={mode === "create" ? t("form.createTitle") : t("form.editTitle")}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-border-light bg-surface p-5 shadow-sm"
        >
          <Input
            name="labelName"
            label={t("form.labelName")}
            value={labelName}
            onChangeText={setLabelName}
            required
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              name="transactionKind"
              label={t("form.transactionKind")}
              value={transactionKind}
              options={kindOptions}
              onChangeValue={(v) => setTransactionKind(v as TransactionKind)}
            />
            <Input
              name="transactionsRequired"
              type="number"
              label={t("form.transactionsRequired")}
              value={transactionsRequired}
              onChangeText={setTransactionsRequired}
              required
            />
          </div>
          <Textarea
            name="description"
            label={t("form.description")}
            value={description}
            onChangeText={setDescription}
          />
          <Input
            name="badgeIcon"
            label={t("form.badgeIcon")}
            value={badgeIcon}
            onChangeText={setBadgeIcon}
          />
          <div className="flex justify-end">
            <MainButton
              text={mode === "create" ? t("form.create") : t("form.save")}
              type="submit"
              loading={loading}
            />
          </div>
        </form>
      </FormShell>
    </PermissionGate>
  );
}
