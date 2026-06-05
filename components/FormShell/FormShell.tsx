"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";

/**
 * Shared wrapper for create / edit / detail screens: a back link, a
 * title/subtitle header (with optional right-aligned actions), and the body.
 * Factored from the layout used by `SellerDetailCard` so every CRUD page in the
 * panel looks consistent.
 */
export function FormShell({
  backHref,
  backLabel,
  title,
  subtitle,
  actions,
  children,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-foreground-secondary hover:text-foreground"
      >
        <ArrowLeft size={16} />
        {backLabel}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Title level="h1" size="h4" weight="bold">
            {title}
          </Title>
          {subtitle && (
            <Text variant="p" color="secondary">
              {subtitle}
            </Text>
          )}
        </div>
        {actions}
      </header>

      {children}
    </div>
  );
}
