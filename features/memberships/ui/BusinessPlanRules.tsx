"use client";

import { useState } from "react";
import MainButton from "@/components/Button/MainButton";
import Input from "@/components/Input/Input";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { humanizeEnum } from "@/utils/formatters";
import {
  type BusinessPlanRule,
  useBusinessPlanRules,
} from "../hooks/useBusinessPlanRules";

function RuleRow({
  rule,
  saving,
  onSave,
}: {
  rule: BusinessPlanRule;
  saving: boolean;
  onSave: (panelSeats: number) => Promise<boolean>;
}) {
  const { t } = useTranslation("memberships");
  const [seats, setSeats] = useState(String(rule.panelSeats));
  const changed = seats.trim() !== "" && Number(seats) !== rule.panelSeats;

  return (
    <div className="grid grid-cols-[1fr_8rem_auto] items-end gap-3">
      <div className="flex flex-col pb-2">
        <Text variant="span" weight="semibold">
          {humanizeEnum(rule.plan)}
        </Text>
        <Text variant="small" color="tertiary">
          {rule.panelSeats === 0 ? t("rules.noPanel") : t("rules.withPanel")}
        </Text>
      </div>
      <Input
        name={`panelSeats-${rule.plan}`}
        type="number"
        label={t("rules.panelSeats")}
        value={seats}
        onChangeText={setSeats}
      />
      <MainButton
        text={t("rules.save")}
        size="sm"
        loading={saving}
        disabled={!changed}
        onPress={() => void onSave(Number(seats))}
      />
    </div>
  );
}

/**
 * What each business plan includes besides its price (USR-15): how many admin
 * accounts a business may have in this panel. The free plan's 0 means no
 * panel; ekoru-users refuses an admin past the seats and the gateway refuses
 * the login.
 */
export function BusinessPlanRules() {
  const { t } = useTranslation("memberships");
  const { rules, loading, saving, update } = useBusinessPlanRules();

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <header className="flex flex-col gap-1">
        <Title level="h2" size="h5" weight="semibold">
          {t("rules.title")}
        </Title>
        <Text variant="small" color="secondary">
          {t("rules.subtitle")}
        </Text>
      </header>

      {loading && rules.length === 0 ? (
        <Text variant="small" color="tertiary">
          {t("rules.loading")}
        </Text>
      ) : (
        <div className="flex flex-col gap-3">
          {rules.map((rule) => (
            <RuleRow
              // Re-mount after a save so the field shows the stored value.
              key={`${rule.plan}-${rule.panelSeats}`}
              rule={rule}
              saving={saving}
              onSave={(panelSeats) => update(rule.plan, panelSeats)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
