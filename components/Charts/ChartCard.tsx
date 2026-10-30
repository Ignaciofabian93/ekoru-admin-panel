"use client";

import clsx from "clsx";
import { useState } from "react";
import { Table2, BarChart3 } from "lucide-react";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";

export type ChartTable = { head: string[]; rows: string[][] };

/**
 * A titled card around one chart, with a switch to the same figures as a table:
 * every value is readable without hovering, and the pale series colors need
 * the table as their accessible twin. `busy` dims the last render while new
 * figures load, instead of flashing a skeleton.
 */
export function ChartCard({
  title,
  subtitle,
  table,
  busy = false,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  table?: ChartTable;
  busy?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation("charts");
  const [asTable, setAsTable] = useState(false);

  return (
    <section
      className={clsx(
        "flex min-w-0 flex-col gap-3 rounded-lg border border-border-light bg-surface p-4 shadow-sm",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Text variant="span" weight="semibold">
            {title}
          </Text>
          {subtitle && (
            <Text variant="small" color="tertiary">
              {subtitle}
            </Text>
          )}
        </div>
        {table && (
          <button
            type="button"
            onClick={() => setAsTable((v) => !v)}
            aria-pressed={asTable}
            className="flex shrink-0 items-center gap-1 rounded-sm px-2 py-1 font-sans text-xs text-foreground-secondary hover:bg-surface-hover"
          >
            {asTable ? <BarChart3 size={14} /> : <Table2 size={14} />}
            {asTable ? t("showChart") : t("showTable")}
          </button>
        )}
      </header>
      <div className={clsx("transition-opacity", busy && "opacity-60")}>
        {asTable && table ? <FiguresTable table={table} /> : children}
      </div>
    </section>
  );
}

function FiguresTable({ table }: { table: ChartTable }) {
  return (
    <div className="max-h-80 overflow-auto">
      <table className="w-full font-sans text-sm">
        <thead>
          <tr className="border-b border-border-light text-left text-foreground-secondary">
            {table.head.map((h, i) => (
              <th
                key={h}
                className={clsx("py-1.5 pr-3 font-medium", i > 0 && "text-right")}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row[0]} className="border-b border-border-light last:border-0">
              {row.map((cell, i) => (
                <td
                  key={i}
                  className={clsx("py-1.5 pr-3", i > 0 && "text-right tabular-nums")}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
