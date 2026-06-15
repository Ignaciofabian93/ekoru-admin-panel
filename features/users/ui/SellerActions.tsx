"use client";

import { BadgeCheck, Ban, Power } from "lucide-react";
import { useState } from "react";
import MainButton from "@/components/Button/MainButton";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Select } from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Textarea } from "@/components/Textarea/Textarea";
import { useTranslation } from "@/i18n/context";
import type { BanReason } from "@/types/enums";
import type { Seller } from "@/types/user";
import { useSellerMutations } from "../hooks/useSellerMutations";

const BAN_REASONS: BanReason[] = [
  "FRAUD",
  "SCAM",
  "PAYMENT_ABUSE",
  "COUNTERFEIT",
  "PROHIBITED_ITEMS",
  "HARASSMENT",
  "SPAM",
  "MULTIPLE_ACCOUNTS",
  "POLICY_VIOLATION",
  "CHARGEBACK_ABUSE",
  "OTHER",
];
// Backend enforces a 5-char minimum on the ban rationale.
const MIN_REASON = 5;

/**
 * Lifecycle action bar for a seller: verify/unverify (MANAGE_USERS) plus
 * ban/reactivate (BAN_USERS). Banning expands an inline form to capture the
 * required, auditable reason. Shared by the list modal and the detail page.
 * Calls `onChanged` with the updated seller so the host can refresh in place.
 */
export function SellerActions({
  seller,
  onChanged,
}: {
  seller: Seller;
  onChanged: (updated: Seller) => void;
}) {
  const { t } = useTranslation("users");
  const { verify, ban, reinstate, loading } = useSellerMutations();

  const [mode, setMode] = useState<"idle" | "ban" | "reinstate">("idle");
  const [reasonCode, setReasonCode] = useState<BanReason>("OTHER");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const reasonOptions = BAN_REASONS.map((r) => ({
    value: r,
    label: t(`banReasonCodes.${r}`),
  }));
  const reasonTooShort = touched && reason.trim().length < MIN_REASON;

  const resetForm = () => {
    setMode("idle");
    setReason("");
    setReasonCode("OTHER");
    setTouched(false);
  };

  const handleVerify = async () => {
    const updated = await verify(seller.id);
    if (updated) onChanged(updated);
  };

  const handleBan = async () => {
    setTouched(true);
    if (reason.trim().length < MIN_REASON) return;
    const updated = await ban(seller.id, { reasonCode, reason: reason.trim() });
    if (updated) {
      onChanged(updated);
      resetForm();
    }
  };

  const handleReinstate = async () => {
    const updated = await reinstate(seller.id, reason.trim() || undefined);
    if (updated) {
      onChanged(updated);
      resetForm();
    }
  };

  if (mode === "ban") {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-danger/30 bg-danger/5 p-4">
        <Text variant="span" weight="semibold" color="error">
          {t("detail.banTitle")}
        </Text>
        <Select
          label={t("detail.banReasonCode")}
          value={reasonCode}
          options={reasonOptions}
          onChangeValue={(v) => setReasonCode(v as BanReason)}
        />
        <Textarea
          label={t("detail.banReason")}
          value={reason}
          onChangeText={setReason}
          rows={3}
          placeholder={t("detail.banReasonPlaceholder")}
          hasError={reasonTooShort}
          errorMessage={t("feedback.reasonTooShort")}
        />
        <div className="flex justify-end gap-2">
          <MainButton
            text={t("detail.cancel")}
            variant="outline"
            size="sm"
            disabled={loading}
            onPress={resetForm}
          />
          <MainButton
            text={t("detail.banConfirm")}
            variant="error"
            size="sm"
            leftIcon={Ban}
            loading={loading}
            onPress={handleBan}
          />
        </div>
      </div>
    );
  }

  if (mode === "reinstate") {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-border-light bg-background-secondary p-4">
        <Text variant="span" weight="semibold">
          {t("detail.reinstateTitle")}
        </Text>
        <Textarea
          label={t("detail.reinstateReason")}
          value={reason}
          onChangeText={setReason}
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <MainButton
            text={t("detail.cancel")}
            variant="outline"
            size="sm"
            disabled={loading}
            onPress={resetForm}
          />
          <MainButton
            text={t("detail.reinstateConfirm")}
            variant="primary"
            size="sm"
            leftIcon={Power}
            loading={loading}
            onPress={handleReinstate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <MainButton
        text={seller.isVerified ? t("detail.unverify") : t("detail.verify")}
        variant="secondary_outline"
        size="sm"
        leftIcon={BadgeCheck}
        loading={loading}
        onPress={handleVerify}
      />
      <PermissionGate permission="BAN_USERS">
        {seller.isActive ? (
          <MainButton
            text={t("detail.ban")}
            variant="error"
            size="sm"
            leftIcon={Ban}
            disabled={loading}
            onPress={() => setMode("ban")}
          />
        ) : (
          <MainButton
            text={t("detail.activate")}
            variant="primary"
            size="sm"
            leftIcon={Power}
            disabled={loading}
            onPress={() => setMode("reinstate")}
          />
        )}
      </PermissionGate>
    </div>
  );
}
