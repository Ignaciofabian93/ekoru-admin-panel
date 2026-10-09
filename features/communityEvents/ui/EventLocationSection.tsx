"use client";

import { useQuery } from "@apollo/client/react";
import { useEffect } from "react";
import Input from "@/components/Input/Input";
import Select from "@/components/Select/Select";
import { Title } from "@/components/Title/Title";
import {
  GET_CITIES,
  GET_COUNTIES,
  GET_COUNTRIES,
  GET_REGIONS,
} from "@/graphql/location/queries";
import { useTranslation } from "@/i18n/context";
import type { EventLocationType } from "../types";

export type EventLocationValue = {
  locationType: EventLocationType;
  countryId?: number;
  regionId?: number;
  cityId?: number;
  countyId?: number;
  address: string;
  onlineUrl: string;
};

type Row = { id: number };

const MODES: EventLocationType[] = ["IN_PERSON", "ONLINE", "HYBRID"];

/** True when the value meets the subgraph's rule for its mode. */
export function isLocationComplete(value: EventLocationValue): boolean {
  const placeOk =
    value.locationType === "ONLINE" ||
    (value.address.trim().length > 3 && value.countyId !== undefined);
  const linkOk =
    value.locationType === "IN_PERSON" ||
    /^https?:\/\/\S+\.\S+/.test(value.onlineUrl.trim());
  return placeOk && linkOk;
}

/** The location part of a create/update input, sending only what the mode uses. */
export function locationInput(value: EventLocationValue) {
  return {
    locationType: value.locationType,
    address: value.locationType === "ONLINE" ? null : value.address.trim(),
    countyId: value.locationType === "ONLINE" ? null : (value.countyId ?? null),
    onlineUrl: value.locationType === "IN_PERSON" ? null : value.onlineUrl.trim(),
  };
}

/**
 * Where the event happens: mode, then the country → region → city → comuna
 * cascade and address for in-person/hybrid, the join link for online/hybrid.
 */
export function EventLocationSection({
  value,
  onChange,
}: {
  value: EventLocationValue;
  onChange: (next: EventLocationValue) => void;
}) {
  const { t } = useTranslation("communityEvents");
  const set = (patch: Partial<EventLocationValue>) => onChange({ ...value, ...patch });
  const needsPlace = value.locationType !== "ONLINE";
  const needsLink = value.locationType !== "IN_PERSON";

  const { data: countries } = useQuery<{ countries: (Row & { country: string })[] }>(
    GET_COUNTRIES,
    { skip: !needsPlace },
  );
  const { data: regions } = useQuery<{
    regionsByCountryId: (Row & { region: string })[];
  }>(GET_REGIONS, {
    variables: { countryId: value.countryId },
    skip: !needsPlace || !value.countryId,
  });
  const { data: cities } = useQuery<{ citiesByRegionId: (Row & { city: string })[] }>(
    GET_CITIES,
    { variables: { regionId: value.regionId }, skip: !needsPlace || !value.regionId },
  );
  const { data: counties } = useQuery<{ countiesByCityId: (Row & { county: string })[] }>(
    GET_COUNTIES,
    { variables: { cityId: value.cityId }, skip: !needsPlace || !value.cityId },
  );

  // Default to Chile so the country select rarely needs touching.
  const countryList = countries?.countries;
  useEffect(() => {
    if (value.countryId || !countryList?.length) return;
    const chile =
      countryList.find((c) => c.country.toLowerCase() === "chile") ?? countryList[0];
    if (chile) onChange({ ...value, countryId: chile.id });
  }, [countryList, value, onChange]);

  const toOptions = <T extends Row>(rows: T[] | undefined, label: (r: T) => string) =>
    (rows ?? []).map((r) => ({ value: String(r.id), label: label(r) }));

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
      <Title level="h2" size="h6" weight="semibold">
        {t("sections.location")}
      </Title>

      <Select
        name="locationType"
        label={t("fields.locationType")}
        options={MODES.map((mode) => ({ value: mode, label: t(`modes.${mode}`) }))}
        value={value.locationType}
        onChangeValue={(v) => set({ locationType: v as EventLocationType })}
      />

      {needsPlace && (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Select
              name="countryId"
              label={t("fields.country")}
              options={toOptions(countries?.countries, (c) => c.country)}
              value={value.countryId ? String(value.countryId) : undefined}
              onChangeValue={(v) =>
                set({
                  countryId: Number(v),
                  regionId: undefined,
                  cityId: undefined,
                  countyId: undefined,
                })
              }
            />
            <Select
              name="regionId"
              label={t("fields.region")}
              options={toOptions(regions?.regionsByCountryId, (r) => r.region)}
              value={value.regionId ? String(value.regionId) : undefined}
              disabled={!value.countryId}
              onChangeValue={(v) =>
                set({ regionId: Number(v), cityId: undefined, countyId: undefined })
              }
            />
            <Select
              name="cityId"
              label={t("fields.city")}
              options={toOptions(cities?.citiesByRegionId, (c) => c.city)}
              value={value.cityId ? String(value.cityId) : undefined}
              disabled={!value.regionId}
              onChangeValue={(v) => set({ cityId: Number(v), countyId: undefined })}
            />
            <Select
              name="countyId"
              label={t("fields.county")}
              options={toOptions(counties?.countiesByCityId, (c) => c.county)}
              value={value.countyId ? String(value.countyId) : undefined}
              disabled={!value.cityId}
              onChangeValue={(v) => set({ countyId: Number(v) })}
            />
          </div>
          <Input
            name="address"
            label={t("fields.address")}
            value={value.address}
            onChangeText={(v) => set({ address: v })}
          />
        </>
      )}

      {needsLink && (
        <Input
          name="onlineUrl"
          label={t("fields.onlineUrl")}
          placeholder="https://…"
          value={value.onlineUrl}
          onChangeText={(v) => set({ onlineUrl: v })}
        />
      )}
    </section>
  );
}
