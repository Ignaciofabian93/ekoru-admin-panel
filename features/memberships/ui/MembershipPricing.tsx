"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import MainButton from "@/components/Button/MainButton";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import Input from "@/components/Input/Input";
import { Select } from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useCountries } from "@/features/locations/hooks/useLocations";
import { useTranslation } from "@/i18n/context";
import { useMembershipMutations } from "../hooks/useMembershipMutations";
import { useMembershipPricing } from "../hooks/useMemberships";
import type { MembershipKind, MembershipPricing as Pricing } from "../types";

function PricingForm({
  kind,
  membershipId,
  countryId,
  pricing,
  onChanged,
}: {
  kind: MembershipKind;
  membershipId: number;
  countryId: number;
  pricing: Pricing | null;
  onChanged: () => void;
}) {
  const { t } = useTranslation("memberships");
  const { upsertPricing, deletePricing, loading } = useMembershipMutations(kind);
  const [currency, setCurrency] = useState(pricing?.currency ?? "");
  const [price, setPrice] = useState(pricing != null ? String(pricing.price) : "");
  const [isActive, setIsActive] = useState(pricing?.isActive ?? true);

  const save = async () => {
    if (!currency.trim()) return;
    const ok = await upsertPricing(membershipId, {
      countryId,
      currency: currency.trim(),
      price: Number(price) || 0,
      isActive,
    });
    if (ok) onChanged();
  };

  const remove = async () => {
    if (!window.confirm(t("pricing.deleteConfirm"))) return;
    const ok = await deletePricing(membershipId, countryId);
    if (ok) onChanged();
  };

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border-light p-4">
      {!pricing && (
        <Text variant="small" color="tertiary">
          {t("pricing.none")}
        </Text>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          name="currency"
          label={t("pricing.currency")}
          value={currency}
          onChangeText={setCurrency}
        />
        <Input
          name="price"
          type="number"
          label={t("pricing.price")}
          value={price}
          onChangeText={setPrice}
        />
      </div>
      <Checkbox label={t("pricing.isActive")} checked={isActive} onChange={setIsActive} />
      <div className="flex items-center justify-between">
        {pricing ? (
          <MainButton
            text={t("pricing.delete")}
            variant="error"
            size="sm"
            leftIcon={Trash2}
            loading={loading}
            onPress={remove}
          />
        ) : (
          <span />
        )}
        <MainButton text={t("pricing.save")} size="sm" loading={loading} onPress={save} />
      </div>
    </div>
  );
}

export function MembershipPricing({
  kind,
  membershipId,
}: {
  kind: MembershipKind;
  membershipId: number;
}) {
  const { t } = useTranslation("memberships");
  const { countries } = useCountries();
  const [countryId, setCountryId] = useState<number | undefined>(undefined);
  const { pricing, loading, refetch } = useMembershipPricing(
    kind,
    membershipId,
    countryId,
  );

  const options = [
    { value: "", label: t("pricing.selectCountry") },
    ...countries.map((c) => ({ value: String(c.id), label: c.country || `#${c.id}` })),
  ];

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <Title level="h2" size="h6" weight="semibold">
        {t("pricing.title")}
      </Title>

      <Select
        label={t("pricing.country")}
        value={countryId != null ? String(countryId) : ""}
        options={options}
        onChangeValue={(v) => setCountryId(v ? Number(v) : undefined)}
      />

      {countries.length === 0 && (
        <Text variant="small" color="tertiary">
          {t("pricing.noCountries")}
        </Text>
      )}

      {countryId != null && !loading && (
        <PricingForm
          key={`${countryId}-${pricing?.id ?? "none"}-${pricing?.price ?? ""}`}
          kind={kind}
          membershipId={membershipId}
          countryId={countryId}
          pricing={pricing}
          onChanged={() => refetch()}
        />
      )}
    </section>
  );
}
