import type { ExportColumn } from "@/utils/exportXlsx";
import { formatDate } from "@/utils/formatters";
import type { Seller } from "@/types/user";
import { sellerDisplayName } from "./types";

type Translate = (key: string, params?: Record<string, string>) => string;

/**
 * Column layout shared by both export actions (selected rows and full backup).
 * `t` is the `users` namespace, `tc` the shared `common` namespace; `lang`
 * localizes dates. Order here is the column order in the spreadsheet.
 */
export function buildSellerExportColumns(
  t: Translate,
  tc: Translate,
  lang: string,
): ExportColumn<Seller>[] {
  return [
    { header: "ID", value: (s) => s.id },
    { header: t("table.name"), value: (s) => sellerDisplayName(s) },
    { header: t("table.email"), value: (s) => s.email },
    { header: t("table.type"), value: (s) => t(`sellerType.${s.sellerType}`) },
    {
      header: t("table.status"),
      value: (s) => (s.isActive ? tc("common.active") : tc("common.inactive")),
    },
    {
      header: t("table.verified"),
      value: (s) => (s.isVerified ? tc("common.yes") : tc("common.no")),
    },
    { header: t("table.points"), value: (s) => s.points ?? 0 },
    { header: t("export.phone"), value: (s) => s.phone ?? "" },
    { header: t("export.website"), value: (s) => s.website ?? "" },
    { header: t("export.country"), value: (s) => s.country?.country ?? "" },
    { header: t("export.region"), value: (s) => s.region?.region ?? "" },
    { header: t("export.city"), value: (s) => s.city?.city ?? "" },
    { header: t("table.joined"), value: (s) => formatDate(s.createdAt, lang) },
  ];
}
