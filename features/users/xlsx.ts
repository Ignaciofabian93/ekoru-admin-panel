import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import type {
  BusinessApprovalStatus,
  BusinessType,
  ContactMethod,
  Language,
  SellerType,
} from "@/types/enums";

/**
 * Sellers workbook: the XLSX round trip for maintenance, bulk edits and
 * backups. Four tabs, imported in this order so a seller exists before its
 * profile:
 *   sellers     — one row per account (id updates, or restores under that id;
 *                 no id matches by email, else creates)
 *   persons     — person profiles, by sellerId
 *   businesses  — business profiles, by sellerId
 *   preferences — notification and privacy switches, by sellerId
 * Headers are the backend field names, so an exported file re-imports as-is.
 * Values are taken as they are in the file; an empty cell keeps the current
 * value (a JSON or date cell left empty is not cleared). Passwords are never
 * exported: a created account signs in with "forgot password".
 */

// ─── Raw rows (rawSellers) ────────────────────────────────────────────────────

export type RawPersonProfile = {
  firstName: string;
  lastName?: string | null;
  displayName?: string | null;
  bio?: string | null;
  birthday?: string | null;
  profileImage?: string | null;
  coverImage?: string | null;
  allowExchanges: boolean;
};

export type RawBusinessProfile = {
  businessName: string;
  description?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  businessType: BusinessType;
  legalBusinessName?: string | null;
  taxId?: string | null;
  businessStartDate?: string | null;
  legalRepresentative?: string | null;
  legalRepresentativeTaxId?: string | null;
  shippingPolicy?: string | null;
  returnPolicy?: string | null;
  serviceArea?: string | null;
  yearsOfExperience?: number | null;
  certifications: string[];
  travelRadius?: number | null;
  businessHours?: string | null;
  approvalStatus: BusinessApprovalStatus;
  applicationMessage?: string | null;
  reviewedAt?: string | null;
  reviewedById?: string | null;
  rejectionReason?: string | null;
};

export type RawSellerPreferences = {
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  showMySocials: boolean;
  showMyAddress: boolean;
  enableTwoFactorAuth: boolean;
  enableLoginAlerts: boolean;
};

export type RawSeller = {
  id: string;
  email: string;
  sellerType: SellerType;
  isActive: boolean;
  isVerified: boolean;
  points: number;
  sellerLevelId?: number | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  preferredContactMethod?: ContactMethod | null;
  socialMediaLinks?: string | null;
  countryId?: number | null;
  regionId?: number | null;
  cityId?: number | null;
  countyId?: number | null;
  contentLanguage?: Language | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  personProfile?: RawPersonProfile | null;
  businessProfile?: RawBusinessProfile | null;
  preferences?: RawSellerPreferences | null;
};

// ─── Export ───────────────────────────────────────────────────────────────────

const text = (v: string | number | null | undefined) =>
  v === null || v === undefined ? "" : v;

const PREFERENCE_KEYS = [
  "enableEmailNotifications",
  "enablePushNotifications",
  "showMySocials",
  "showMyAddress",
  "enableTwoFactorAuth",
  "enableLoginAlerts",
] as const;

export function buildSellerWorkbook(sellers: RawSeller[]): BuiltSheet[] {
  const persons = sellers.filter((s) => s.personProfile);
  const businesses = sellers.filter((s) => s.businessProfile);
  const withPreferences = sellers.filter((s) => s.preferences);
  return [
    buildSheet({
      name: "sellers",
      rows: sellers,
      columns: [
        { header: "id", value: (s) => s.id },
        { header: "email", value: (s) => s.email },
        { header: "sellerType", value: (s) => s.sellerType },
        { header: "isActive", value: (s) => s.isActive },
        { header: "isVerified", value: (s) => s.isVerified },
        { header: "points", value: (s) => s.points },
        { header: "sellerLevelId", value: (s) => text(s.sellerLevelId) },
        { header: "phone", value: (s) => text(s.phone) },
        { header: "address", value: (s) => text(s.address) },
        { header: "website", value: (s) => text(s.website) },
        {
          header: "preferredContactMethod",
          value: (s) => text(s.preferredContactMethod),
        },
        { header: "socialMediaLinks", value: (s) => text(s.socialMediaLinks) },
        { header: "countryId", value: (s) => text(s.countryId) },
        { header: "regionId", value: (s) => text(s.regionId) },
        { header: "cityId", value: (s) => text(s.cityId) },
        { header: "countyId", value: (s) => text(s.countyId) },
        { header: "contentLanguage", value: (s) => text(s.contentLanguage) },
        // Reference only: not imported.
        { header: "lastLoginAt (read-only)", value: (s) => text(s.lastLoginAt) },
        { header: "createdAt (read-only)", value: (s) => s.createdAt },
      ],
    }),
    buildSheet({
      name: "persons",
      rows: persons,
      columns: [
        { header: "sellerId", value: (s) => s.id },
        { header: "email (read-only)", value: (s) => s.email },
        { header: "firstName", value: (s) => s.personProfile!.firstName },
        { header: "lastName", value: (s) => text(s.personProfile!.lastName) },
        { header: "displayName", value: (s) => text(s.personProfile!.displayName) },
        { header: "bio", value: (s) => text(s.personProfile!.bio) },
        { header: "birthday", value: (s) => text(s.personProfile!.birthday) },
        { header: "profileImage", value: (s) => text(s.personProfile!.profileImage) },
        { header: "coverImage", value: (s) => text(s.personProfile!.coverImage) },
        { header: "allowExchanges", value: (s) => s.personProfile!.allowExchanges },
      ],
    }),
    buildSheet({
      name: "businesses",
      rows: businesses,
      columns: [
        { header: "sellerId", value: (s) => s.id },
        { header: "email (read-only)", value: (s) => s.email },
        { header: "businessName", value: (s) => s.businessProfile!.businessName },
        { header: "businessType", value: (s) => s.businessProfile!.businessType },
        { header: "approvalStatus", value: (s) => s.businessProfile!.approvalStatus },
        { header: "description", value: (s) => text(s.businessProfile!.description) },
        { header: "logo", value: (s) => text(s.businessProfile!.logo) },
        { header: "coverImage", value: (s) => text(s.businessProfile!.coverImage) },
        {
          header: "legalBusinessName",
          value: (s) => text(s.businessProfile!.legalBusinessName),
        },
        { header: "taxId", value: (s) => text(s.businessProfile!.taxId) },
        {
          header: "businessStartDate",
          value: (s) => text(s.businessProfile!.businessStartDate),
        },
        {
          header: "legalRepresentative",
          value: (s) => text(s.businessProfile!.legalRepresentative),
        },
        {
          header: "legalRepresentativeTaxId",
          value: (s) => text(s.businessProfile!.legalRepresentativeTaxId),
        },
        {
          header: "shippingPolicy",
          value: (s) => text(s.businessProfile!.shippingPolicy),
        },
        { header: "returnPolicy", value: (s) => text(s.businessProfile!.returnPolicy) },
        { header: "serviceArea", value: (s) => text(s.businessProfile!.serviceArea) },
        {
          header: "yearsOfExperience",
          value: (s) => text(s.businessProfile!.yearsOfExperience),
        },
        {
          header: "certifications",
          value: (s) => (s.businessProfile!.certifications ?? []).join(" | "),
        },
        { header: "travelRadius", value: (s) => text(s.businessProfile!.travelRadius) },
        { header: "businessHours", value: (s) => text(s.businessProfile!.businessHours) },
        {
          header: "applicationMessage",
          value: (s) => text(s.businessProfile!.applicationMessage),
        },
        { header: "reviewedAt", value: (s) => text(s.businessProfile!.reviewedAt) },
        { header: "reviewedById", value: (s) => text(s.businessProfile!.reviewedById) },
        {
          header: "rejectionReason",
          value: (s) => text(s.businessProfile!.rejectionReason),
        },
      ],
    }),
    buildSheet({
      name: "preferences",
      rows: withPreferences,
      columns: [
        { header: "sellerId", value: (s) => s.id },
        { header: "email (read-only)", value: (s) => s.email },
        ...PREFERENCE_KEYS.map((key) => ({
          header: key,
          value: (s: RawSeller) => s.preferences![key],
        })),
      ],
    }),
  ];
}

// ─── Import cell coercion ─────────────────────────────────────────────────────

type Row = Record<string, string>;

const cell = (row: Row, key: string): string => (row[key] ?? "").trim();

function str(row: Row, key: string): string | undefined {
  const v = cell(row, key);
  return v === "" ? undefined : v;
}

function int(row: Row, key: string): number | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error(`${key}: "${v}" is not a whole number`);
  return n;
}

function bool(row: Row, key: string): boolean | undefined {
  const v = cell(row, key).toLowerCase();
  if (v === "") return undefined;
  if (["true", "1", "yes", "si", "sí", "x", "verdadero"].includes(v)) return true;
  if (["false", "0", "no", "falso"].includes(v)) return false;
  throw new Error(`${key}: "${v}" is not a boolean (use TRUE/FALSE)`);
}

function oneOf<T extends string>(
  row: Row,
  key: string,
  allowed: readonly T[],
): T | undefined {
  const v = cell(row, key).toUpperCase();
  if (v === "") return undefined;
  if (!allowed.includes(v as T))
    throw new Error(`${key}: "${v}" must be one of ${allowed.join(", ")}`);
  return v as T;
}

function json(row: Row, key: string): string | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  try {
    JSON.parse(v);
  } catch {
    throw new Error(`${key}: not valid JSON`);
  }
  return v;
}

function date(row: Row, key: string): string | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) throw new Error(`${key}: "${v}" is not a date`);
  return d.toISOString();
}

function list(row: Row, key: string): string[] | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  return v
    .split(/[|\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function requireSellerId(row: Row): string {
  const id = str(row, "sellerId");
  if (!id) throw new Error("sellerId is required");
  return id;
}

const SELLER_TYPES = ["PERSON", "STARTUP", "COMPANY"] as const;
const BUSINESS_TYPES = ["RETAIL", "SERVICES", "MIXED"] as const;
const APPROVAL = ["PENDING", "APPROVED", "REJECTED"] as const;
const CONTACT = [
  "EMAIL",
  "WHATSAPP",
  "PHONE",
  "INSTAGRAM",
  "FACEBOOK",
  "WEBSITE",
  "TIKTOK",
] as const;
const LANGUAGES = ["ES", "EN", "FR", "PT", "DE"] as const;

// ─── Import mappers (one per sheet) ───────────────────────────────────────────

export type SellerUpsertRow = {
  id?: string;
  email?: string;
  sellerType?: SellerType;
  isActive?: boolean;
  isVerified?: boolean;
  points?: number;
  sellerLevelId?: number;
  phone?: string;
  address?: string;
  website?: string;
  preferredContactMethod?: ContactMethod;
  socialMediaLinks?: string;
  countryId?: number;
  regionId?: number;
  cityId?: number;
  countyId?: number;
  contentLanguage?: Language;
};

export function mapSellerRow(row: Row): SellerUpsertRow {
  const mapped: SellerUpsertRow = {
    id: str(row, "id"),
    email: str(row, "email"),
    sellerType: oneOf(row, "sellerType", SELLER_TYPES),
    isActive: bool(row, "isActive"),
    isVerified: bool(row, "isVerified"),
    points: int(row, "points"),
    sellerLevelId: int(row, "sellerLevelId"),
    phone: str(row, "phone"),
    address: str(row, "address"),
    website: str(row, "website"),
    preferredContactMethod: oneOf(row, "preferredContactMethod", CONTACT),
    socialMediaLinks: json(row, "socialMediaLinks"),
    countryId: int(row, "countryId"),
    regionId: int(row, "regionId"),
    cityId: int(row, "cityId"),
    countyId: int(row, "countyId"),
    contentLanguage: oneOf(row, "contentLanguage", LANGUAGES),
  };
  if (!mapped.id && !mapped.email) throw new Error("id or email is required");
  return mapped;
}

export type PersonProfileUpsertRow = {
  sellerId: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  birthday?: string;
  profileImage?: string;
  coverImage?: string;
  allowExchanges?: boolean;
};

export function mapPersonRow(row: Row): PersonProfileUpsertRow {
  return {
    sellerId: requireSellerId(row),
    firstName: str(row, "firstName"),
    lastName: str(row, "lastName"),
    displayName: str(row, "displayName"),
    bio: str(row, "bio"),
    birthday: date(row, "birthday"),
    profileImage: str(row, "profileImage"),
    coverImage: str(row, "coverImage"),
    allowExchanges: bool(row, "allowExchanges"),
  };
}

export type BusinessProfileUpsertRow = {
  sellerId: string;
  businessName?: string;
  businessType?: BusinessType;
  approvalStatus?: BusinessApprovalStatus;
  description?: string;
  logo?: string;
  coverImage?: string;
  legalBusinessName?: string;
  taxId?: string;
  businessStartDate?: string;
  legalRepresentative?: string;
  legalRepresentativeTaxId?: string;
  shippingPolicy?: string;
  returnPolicy?: string;
  serviceArea?: string;
  yearsOfExperience?: number;
  certifications?: string[];
  travelRadius?: number;
  businessHours?: string;
  applicationMessage?: string;
  reviewedAt?: string;
  reviewedById?: string;
  rejectionReason?: string;
};

export function mapBusinessRow(row: Row): BusinessProfileUpsertRow {
  return {
    sellerId: requireSellerId(row),
    businessName: str(row, "businessName"),
    businessType: oneOf(row, "businessType", BUSINESS_TYPES),
    approvalStatus: oneOf(row, "approvalStatus", APPROVAL),
    description: str(row, "description"),
    logo: str(row, "logo"),
    coverImage: str(row, "coverImage"),
    legalBusinessName: str(row, "legalBusinessName"),
    taxId: str(row, "taxId"),
    businessStartDate: date(row, "businessStartDate"),
    legalRepresentative: str(row, "legalRepresentative"),
    legalRepresentativeTaxId: str(row, "legalRepresentativeTaxId"),
    shippingPolicy: str(row, "shippingPolicy"),
    returnPolicy: str(row, "returnPolicy"),
    serviceArea: str(row, "serviceArea"),
    yearsOfExperience: int(row, "yearsOfExperience"),
    certifications: list(row, "certifications"),
    travelRadius: int(row, "travelRadius"),
    businessHours: json(row, "businessHours"),
    applicationMessage: str(row, "applicationMessage"),
    reviewedAt: date(row, "reviewedAt"),
    reviewedById: str(row, "reviewedById"),
    rejectionReason: str(row, "rejectionReason"),
  };
}

export type SellerPreferencesUpsertRow = { sellerId: string } & Partial<
  Record<(typeof PREFERENCE_KEYS)[number], boolean>
>;

export function mapPreferencesRow(row: Row): SellerPreferencesUpsertRow {
  const mapped: SellerPreferencesUpsertRow = { sellerId: requireSellerId(row) };
  for (const key of PREFERENCE_KEYS) mapped[key] = bool(row, key);
  return mapped;
}
