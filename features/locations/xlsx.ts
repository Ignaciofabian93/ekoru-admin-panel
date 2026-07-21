import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import type { Language } from "@/types/enums";

/**
 * XLSX round-trip for the location tables. One workbook with five tabs, whose
 * headers are the raw backend field names so an edited file re-imports as-is:
 *
 * - `countries` (id, code)
 * - `country-translations` (id, countryId, language, name)
 * - `regions` (id, region, countryId)
 * - `cities` (id, city, regionId)
 * - `counties` (id, county, cityId)
 *
 * Rows with an `id` update; rows without an `id` create. Empty cells leave the
 * current value unchanged. On import the sheets commit top-down (countries →
 * counties) so parents exist before their children.
 */

export const SHEETS = {
  countries: "countries",
  countryTranslations: "country-translations",
  regions: "regions",
  cities: "cities",
  counties: "counties",
} as const;

const LANGUAGES: Language[] = ["ES", "EN", "FR", "PT", "DE"];

// ─── Raw rows (as returned by the raw admin queries) ──────────────────────────

export type RawCountry = { id: number; code: string | null };
export type RawCountryTranslation = {
  id: number;
  countryId: number;
  language: Language;
  name: string;
};
export type RawRegion = { id: number; region: string; countryId: number };
export type RawCity = { id: number; city: string; regionId: number };
export type RawCounty = { id: number; county: string; cityId: number };

// ─── Upsert rows (mirror the backend *UpsertRowInput types) ───────────────────

export type CountryUpsertRow = { id?: number; code?: string | null };
export type CountryTranslationUpsertRow = {
  id?: number;
  countryId?: number;
  language?: Language;
  name?: string;
};
export type RegionUpsertRow = { id?: number; region?: string; countryId?: number };
export type CityUpsertRow = { id?: number; city?: string; regionId?: number };
export type CountyUpsertRow = { id?: number; county?: string; cityId?: number };

export type LocationExport = {
  countries: RawCountry[];
  countryTranslations: RawCountryTranslation[];
  regions: RawRegion[];
  cities: RawCity[];
  counties: RawCounty[];
};

// ─── Export ───────────────────────────────────────────────────────────────────

export function buildLocationSheets(data: LocationExport): BuiltSheet[] {
  return [
    buildSheet({
      name: SHEETS.countries,
      rows: data.countries,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "code", value: (r) => r.code ?? "" },
      ],
    }),
    buildSheet({
      name: SHEETS.countryTranslations,
      rows: data.countryTranslations,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "countryId", value: (r) => r.countryId },
        { header: "language", value: (r) => r.language },
        { header: "name", value: (r) => r.name },
      ],
    }),
    buildSheet({
      name: SHEETS.regions,
      rows: data.regions,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "region", value: (r) => r.region },
        { header: "countryId", value: (r) => r.countryId },
      ],
    }),
    buildSheet({
      name: SHEETS.cities,
      rows: data.cities,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "city", value: (r) => r.city },
        { header: "regionId", value: (r) => r.regionId },
      ],
    }),
    buildSheet({
      name: SHEETS.counties,
      rows: data.counties,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "county", value: (r) => r.county },
        { header: "cityId", value: (r) => r.cityId },
      ],
    }),
  ];
}

// ─── Import cell coercion ─────────────────────────────────────────────────────

const cell = (row: Record<string, string>, key: string): string =>
  (row[key] ?? "").trim();

function intCell(row: Record<string, string>, key: string): number | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error(`${key}: "${v}" is not an integer`);
  return n;
}

function stringCell(row: Record<string, string>, key: string): string | undefined {
  const v = cell(row, key);
  return v === "" ? undefined : v;
}

function enumCell<T extends string>(
  row: Record<string, string>,
  key: string,
  allowed: readonly T[],
): T | undefined {
  const v = cell(row, key).toUpperCase();
  if (v === "") return undefined;
  if (!allowed.includes(v as T))
    throw new Error(`${key}: "${v}" must be one of ${allowed.join(", ")}`);
  return v as T;
}

// ─── Import row mappers ───────────────────────────────────────────────────────

export function mapCountryRow(row: Record<string, string>): CountryUpsertRow {
  return { id: intCell(row, "id"), code: stringCell(row, "code") };
}

export function mapCountryTranslationRow(
  row: Record<string, string>,
): CountryTranslationUpsertRow {
  return {
    id: intCell(row, "id"),
    countryId: intCell(row, "countryId"),
    language: enumCell<Language>(row, "language", LANGUAGES),
    name: stringCell(row, "name"),
  };
}

export function mapRegionRow(row: Record<string, string>): RegionUpsertRow {
  return {
    id: intCell(row, "id"),
    region: stringCell(row, "region"),
    countryId: intCell(row, "countryId"),
  };
}

export function mapCityRow(row: Record<string, string>): CityUpsertRow {
  return {
    id: intCell(row, "id"),
    city: stringCell(row, "city"),
    regionId: intCell(row, "regionId"),
  };
}

export function mapCountyRow(row: Record<string, string>): CountyUpsertRow {
  return {
    id: intCell(row, "id"),
    county: stringCell(row, "county"),
    cityId: intCell(row, "cityId"),
  };
}
