"use client";

import clsx from "clsx";
import { useTranslation } from "@/i18n/context";

export type Column<T> = {
  /** Stable key, also used as React key for the cell. */
  key: string;
  header: string;
  /** Cell renderer. Receives the full row. */
  render: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
};

/**
 * Generic, presentational table for CRUD list screens. Pass typed columns and
 * rows; it stays dumb about data fetching so each feature owns its own hook.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  loading = false,
  emptyLabel,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyLabel?: string;
}) {
  const { t } = useTranslation();
  const alignClass = { left: "text-left", center: "text-center", right: "text-right" };

  return (
    <div className="overflow-x-auto rounded-lg border border-border-light bg-surface shadow-sm">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border-light bg-background-secondary">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  "px-4 py-3 font-sans text-xs font-semibold uppercase tracking-wide text-foreground-tertiary",
                  col.align && alignClass[col.align],
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center font-sans text-sm text-foreground-tertiary"
              >
                {t("common.loading")}
              </td>
            </tr>
          )}

          {!loading && rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center font-sans text-sm text-foreground-tertiary"
              >
                {emptyLabel ?? t("common.noResults")}
              </td>
            </tr>
          )}

          {!loading &&
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={clsx(
                  "border-b border-border-light last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-surface-hover",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx(
                      "px-4 py-3 font-sans text-sm text-foreground",
                      col.align && alignClass[col.align],
                      col.className,
                    )}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
