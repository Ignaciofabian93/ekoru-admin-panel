import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import {
  SERVICE_PRICING,
  type RawService,
  type ServiceFaqUpsertRow,
  type ServiceMediaUpsertRow,
  type ServicePricing,
  type ServiceUpsertRow,
} from "./types";

/**
 * XLSX round-trip for services. Three tabs — `services` (base rows), `media`
 * and `faqs`. Headers are the raw backend field names so an edited file
 * re-imports as-is. Metrics + timestamps are export-only reference columns the
 * mapper ignores. List cells (images/tags) join with " | " and split back on
 * "|" or newline. Rows with an id update; rows without an id create.
 */
export const SERVICES_SHEET = "services";
export const MEDIA_SHEET = "media";
export const FAQS_SHEET = "faqs";

const joinList = (values: string[] | null | undefined) => (values ?? []).join(" | ");

export function buildServiceSheets(rows: RawService[]): BuiltSheet[] {
  return [
    buildSheet({
      name: SERVICES_SHEET,
      rows,
      columns: [
        { header: "id", value: (r) => r.id },
        { header: "name", value: (r) => r.name },
        { header: "description", value: (r) => r.description },
        { header: "sellerId", value: (r) => r.sellerId },
        { header: "subcategoryId", value: (r) => r.subcategoryId },
        { header: "pricingType", value: (r) => r.pricingType },
        { header: "basePrice", value: (r) => r.basePrice },
        { header: "priceRange", value: (r) => r.priceRange },
        { header: "duration", value: (r) => r.duration },
        { header: "isActive", value: (r) => r.isActive },
        { header: "images", value: (r) => joinList(r.images) },
        { header: "tags", value: (r) => joinList(r.tags) },
        { header: "maxConcurrentBookings", value: (r) => r.maxConcurrentBookings },
        { header: "advanceBookingDays", value: (r) => r.advanceBookingDays },
        { header: "serviceRadius", value: (r) => r.serviceRadius },
        { header: "isRemoteService", value: (r) => r.isRemoteService },
        { header: "isCurrentlyAvailable", value: (r) => r.isCurrentlyAvailable },
        { header: "averageRating (read-only)", value: (r) => r.averageRating },
        { header: "viewCount (read-only)", value: (r) => r.viewCount },
        { header: "createdAt", value: (r) => r.createdAt },
        { header: "updatedAt", value: (r) => r.updatedAt },
      ],
    }),
    buildSheet({
      name: MEDIA_SHEET,
      rows: rows.flatMap((r) => r.serviceMedia ?? []),
      columns: [
        { header: "id", value: (m) => m.id },
        { header: "serviceId", value: (m) => m.serviceId },
        { header: "mediaType", value: (m) => m.mediaType },
        { header: "url", value: (m) => m.url },
        { header: "title", value: (m) => m.title },
        { header: "description", value: (m) => m.description },
        { header: "displayOrder", value: (m) => m.displayOrder },
        { header: "isPortfolio", value: (m) => m.isPortfolio },
        { header: "isCertificate", value: (m) => m.isCertificate },
      ],
    }),
    buildSheet({
      name: FAQS_SHEET,
      rows: rows.flatMap((r) => r.serviceFAQ ?? []),
      columns: [
        { header: "id", value: (f) => f.id },
        { header: "serviceId", value: (f) => f.serviceId },
        { header: "subcategoryId", value: (f) => f.subcategoryId },
        { header: "question", value: (f) => f.question },
        { header: "answer", value: (f) => f.answer },
        { header: "displayOrder", value: (f) => f.displayOrder },
        { header: "isActive", value: (f) => f.isActive },
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

// ─── Import row mappers ───────────────────────────────────────────────────────

export function mapServiceRow(row: Record<string, string>): ServiceUpsertRow {
  return {
    id: intCell(row, "id"),
    name: stringCell(row, "name"),
    description: stringCell(row, "description"),
    sellerId: stringCell(row, "sellerId"),
    subcategoryId: intCell(row, "subcategoryId"),
    pricingType: enumCell<ServicePricing>(row, "pricingType", SERVICE_PRICING),
    basePrice: floatCell(row, "basePrice"),
    priceRange: stringCell(row, "priceRange"),
    duration: intCell(row, "duration"),
    isActive: boolCell(row, "isActive"),
    images: listCell(row, "images"),
    tags: listCell(row, "tags"),
    maxConcurrentBookings: intCell(row, "maxConcurrentBookings"),
    advanceBookingDays: intCell(row, "advanceBookingDays"),
    serviceRadius: intCell(row, "serviceRadius"),
    isRemoteService: boolCell(row, "isRemoteService"),
    isCurrentlyAvailable: boolCell(row, "isCurrentlyAvailable"),
  };
}

export function mapServiceMediaRow(row: Record<string, string>): ServiceMediaUpsertRow {
  return {
    id: intCell(row, "id"),
    serviceId: intCell(row, "serviceId"),
    mediaType: stringCell(row, "mediaType"),
    url: stringCell(row, "url"),
    title: stringCell(row, "title"),
    description: stringCell(row, "description"),
    displayOrder: intCell(row, "displayOrder"),
    isPortfolio: boolCell(row, "isPortfolio"),
    isCertificate: boolCell(row, "isCertificate"),
  };
}

export function mapServiceFaqRow(row: Record<string, string>): ServiceFaqUpsertRow {
  return {
    id: intCell(row, "id"),
    serviceId: intCell(row, "serviceId"),
    subcategoryId: intCell(row, "subcategoryId"),
    question: stringCell(row, "question"),
    answer: stringCell(row, "answer"),
    displayOrder: intCell(row, "displayOrder"),
    isActive: boolCell(row, "isActive"),
  };
}
