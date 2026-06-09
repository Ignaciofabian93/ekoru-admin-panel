"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";
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
 * Optional multi-row selection. When provided, the table grows a leading
 * checkbox column with a header "select all" box. Selection state lives in the
 * caller so it survives pagination and feeds actions like export.
 */
export type TableSelection<T> = {
  isRowSelected: (row: T) => boolean;
  onToggleRow: (row: T) => void;
  /** Checked state of the header box (all visible rows selected). */
  allSelected: boolean;
  /** Drives the header box's indeterminate state (some but not all). */
  someSelected: boolean;
  onToggleAll: () => void;
};

/** Header checkbox that exposes an indeterminate (partial selection) state. */
function HeaderCheckbox({
  allSelected,
  someSelected,
  onToggle,
}: {
  allSelected: boolean;
  someSelected: boolean;
  onToggle: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={allSelected}
      onChange={onToggle}
      aria-label="select-all"
      className="size-4 cursor-pointer accent-primary"
    />
  );
}

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
  selection,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyLabel?: string;
  selection?: TableSelection<T>;
}) {
  const { t } = useTranslation();
  const alignClass = { left: "text-left", center: "text-center", right: "text-right" };
  // +1 spanned column when the selection checkbox column is present.
  const colSpan = columns.length + (selection ? 1 : 0);

  return (
    <div className="overflow-x-auto rounded-lg border border-border-light bg-surface shadow-sm">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border-light bg-background-secondary">
            {selection && (
              <th className="w-10 px-4 py-3">
                <HeaderCheckbox
                  allSelected={selection.allSelected}
                  someSelected={selection.someSelected}
                  onToggle={selection.onToggleAll}
                />
              </th>
            )}
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
                colSpan={colSpan}
                className="px-4 py-10 text-center font-sans text-sm text-foreground-tertiary"
              >
                {t("common.loading")}
              </td>
            </tr>
          )}

          {!loading && rows.length === 0 && (
            <tr>
              <td
                colSpan={colSpan}
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
                {selection && (
                  <td className="w-10 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selection.isRowSelected(row)}
                      onChange={() => selection.onToggleRow(row)}
                      aria-label="select-row"
                      className="size-4 cursor-pointer accent-primary"
                    />
                  </td>
                )}
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
