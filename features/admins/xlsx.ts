import { buildSheet, type BuiltSheet } from "@/utils/exportXlsx";
import type { AdminPermission, AdminRole, AdminType } from "@/types/enums";
import type { Admin } from "@/types/admin";
import { ADMIN_PERMISSIONS, ADMIN_ROLES, ADMIN_TYPES } from "./constants";

/**
 * XLSX round-trip for admins. Single `data` tab; headers are the raw backend
 * field names so an edited file re-imports as-is. Rows with an `id` (uuid)
 * update; rows without an `id` create.
 *
 * `permissions` is a `|`-separated list. `password` is export-blank (hashes
 * never leave the server): fill it only on rows you are creating — an update
 * never changes a password unless one is supplied.
 */

const PERMISSION_SET = new Set<string>(ADMIN_PERMISSIONS);

export type AdminUpsertRow = {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  lastName?: string | null;
  adminType?: AdminType;
  role?: AdminRole;
  permissions?: AdminPermission[];
  isActive?: boolean;
  sellerId?: string | null;
};

export function buildAdminSheets(rows: Admin[]): BuiltSheet[] {
  return [
    buildSheet({
      name: "data",
      rows,
      columns: [
        { header: "id", value: (a) => a.id },
        { header: "email", value: (a) => a.email },
        { header: "password", value: () => "" },
        { header: "name", value: (a) => a.name },
        { header: "lastName", value: (a) => a.lastName ?? "" },
        { header: "adminType", value: (a) => a.adminType },
        { header: "role", value: (a) => a.role },
        { header: "permissions", value: (a) => (a.permissions ?? []).join(" | ") },
        { header: "isActive", value: (a) => a.isActive },
        { header: "sellerId", value: (a) => a.sellerId ?? "" },
      ],
    }),
  ];
}

// ─── Import cell coercion ─────────────────────────────────────────────────────

const cell = (row: Record<string, string>, key: string): string =>
  (row[key] ?? "").trim();

function stringCell(row: Record<string, string>, key: string): string | undefined {
  const v = cell(row, key);
  return v === "" ? undefined : v;
}

function boolCell(row: Record<string, string>, key: string): boolean | undefined {
  const v = cell(row, key).toLowerCase();
  if (v === "") return undefined;
  if (["true", "1", "yes", "si", "sí", "x"].includes(v)) return true;
  if (["false", "0", "no"].includes(v)) return false;
  throw new Error(`${key}: "${v}" is not a boolean (use TRUE/FALSE)`);
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

function permissionsCell(
  row: Record<string, string>,
  key: string,
): AdminPermission[] | undefined {
  const v = cell(row, key);
  if (v === "") return undefined;
  const parts = v
    .split(/[|\n]/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const bad = parts.filter((p) => !PERMISSION_SET.has(p));
  if (bad.length > 0) throw new Error(`${key}: unknown permission(s) ${bad.join(", ")}`);
  return parts as AdminPermission[];
}

export function mapAdminRow(row: Record<string, string>): AdminUpsertRow {
  return {
    id: stringCell(row, "id"),
    email: stringCell(row, "email"),
    password: stringCell(row, "password"),
    name: stringCell(row, "name"),
    lastName: stringCell(row, "lastName"),
    adminType: enumCell<AdminType>(row, "adminType", ADMIN_TYPES),
    role: enumCell<AdminRole>(row, "role", ADMIN_ROLES),
    permissions: permissionsCell(row, "permissions"),
    isActive: boolCell(row, "isActive"),
    sellerId: stringCell(row, "sellerId"),
  };
}
