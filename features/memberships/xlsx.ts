import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import type { Language } from "@/types/enums";
import type { Membership, MembershipKind } from "./types";

/**
 * XLSX round-trip for a membership kind (person or business). One workbook with
 * three tabs, whose headers are the raw backend field names so an edited file
 * re-imports as-is:
 *
 * - `data` (id, membershipType, durationMonths, isActive)
 * - `translations` (id, <kind>MembershipId, language, name, description)
 * - `pricing` (id, <kind>MembershipId, countryId, currency, price, isActive)
 *
 * The parent-id column is named per kind (`personMembershipId` /
 * `businessMembershipId`) to match the backend inputs. `description` is a
 * `|`-separated list. Rows with an `id` update; rows without an `id` create.
 * Empty cells leave the current value unchanged; sheets import top-down so the
 * base rows exist before translations/pricing reference them.
 */

const LANGUAGES: Language[] = ["ES", "EN", "FR", "PT", "DE"];

/** The parent-id column/field name for a kind. */
export const parentIdField = (kind: MembershipKind) =>
  kind === "person" ? "personMembershipId" : "businessMembershipId";

// ─── Raw rows ─────────────────────────────────────────────────────────────────

export type RawMembershipTranslation = {
  id: number;
  personMembershipId?: number;
  businessMembershipId?: number;
  language: Language;
  name: string;
  description: string[];
};

export type RawMembershipPricing = {
  id: number;
  personMembershipId?: number;
  businessMembershipId?: number;
  countryId: number;
  currency: string;
  price: number;
  isActive: boolean;
};

// ─── Upsert rows ──────────────────────────────────────────────────────────────

export type MembershipUpsertRow = {
  id?: number;
  membershipType?: string;
  durationMonths?: number;
  isActive?: boolean;
};

export type MembershipTranslationUpsertRow = {
  id?: number;
  personMembershipId?: number;
  businessMembershipId?: number;
  language?: Language;
  name?: string;
  description?: string[];
};

export type MembershipPricingUpsertRow = {
  id?: number;
  personMembershipId?: number;
  businessMembershipId?: number;
  countryId?: number;
  currency?: string;
  price?: number;
  isActive?: boolean;
};

export type MembershipExport = {
  base: Membership[];
  translations: RawMembershipTranslation[];
  pricing: RawMembershipPricing[];
};

// ─── Export ───────────────────────────────────────────────────────────────────

export function buildMembershipSheets(
  kind: MembershipKind,
  data: MembershipExport,
): BuiltSheet[] {
  const idKey = parentIdField(kind);
  const parentId = (r: { personMembershipId?: number; businessMembershipId?: number }) =>
    kind === "person" ? r.personMembershipId : r.businessMembershipId;

  return [
    buildSheet({
      name: "data",
      rows: data.base,
      columns: [
        { header: "id", value: (m) => m.id },
        { header: "membershipType", value: (m) => m.membershipType },
        { header: "durationMonths", value: (m) => m.durationMonths },
        { header: "isActive", value: (m) => m.isActive },
      ],
    }),
    buildSheet({
      name: "translations",
      rows: data.translations,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: idKey, value: (r) => parentId(r) ?? "" },
        { header: "language", value: (r) => r.language },
        { header: "name", value: (r) => r.name },
        { header: "description", value: (r) => (r.description ?? []).join(" | ") },
      ],
    }),
    buildSheet({
      name: "pricing",
      rows: data.pricing,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: idKey, value: (r) => parentId(r) ?? "" },
        { header: "countryId", value: (r) => r.countryId },
        { header: "currency", value: (r) => r.currency },
        { header: "price", value: (r) => r.price },
        { header: "isActive", value: (r) => r.isActive },
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

function floatCell(row: Record<string, string>, key: string): number | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`${key}: "${v}" is not a number`);
  return n;
}

function boolCell(row: Record<string, string>, key: string): boolean | undefined {
  const v = cell(row, key).toLowerCase();
  if (v === "") return undefined;
  if (["true", "1", "yes", "si", "sí", "x"].includes(v)) return true;
  if (["false", "0", "no"].includes(v)) return false;
  throw new Error(`${key}: "${v}" is not a boolean (use TRUE/FALSE)`);
}

function stringCell(row: Record<string, string>, key: string): string | undefined {
  const v = cell(row, key);
  return v === "" ? undefined : v;
}

function listCell(row: Record<string, string>, key: string): string[] | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  return v
    .split(/[|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
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

// ─── Import row mappers (kind-aware for the parent-id column) ──────────────────

export function mapMembershipDataRow(
  membershipTypes: readonly string[],
): (row: Record<string, string>) => MembershipUpsertRow {
  return (row) => ({
    id: intCell(row, "id"),
    membershipType: enumCell(row, "membershipType", membershipTypes),
    durationMonths: intCell(row, "durationMonths"),
    isActive: boolCell(row, "isActive"),
  });
}

export function mapMembershipTranslationRow(
  kind: MembershipKind,
): (row: Record<string, string>) => MembershipTranslationUpsertRow {
  const idKey = parentIdField(kind);
  return (row) => ({
    id: intCell(row, "id"),
    [idKey]: intCell(row, idKey),
    language: enumCell<Language>(row, "language", LANGUAGES),
    name: stringCell(row, "name"),
    description: listCell(row, "description"),
  });
}

export function mapMembershipPricingRow(
  kind: MembershipKind,
): (row: Record<string, string>) => MembershipPricingUpsertRow {
  const idKey = parentIdField(kind);
  return (row) => ({
    id: intCell(row, "id"),
    [idKey]: intCell(row, idKey),
    countryId: intCell(row, "countryId"),
    currency: stringCell(row, "currency"),
    price: floatCell(row, "price"),
    isActive: boolCell(row, "isActive"),
  });
}
