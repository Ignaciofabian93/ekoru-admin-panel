"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type SupportedLanguage } from "@/constants/settings";
import { Logo } from "@/components/Logo/Logo";
import { useTranslation } from "@/i18n/context";
import { useAdmin } from "@/store/useAuthStore";
import { filterNav } from "../constants/nav";
import { Text } from "@/components/Text/Text";

export function Sidebar({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const admin = useAdmin();
  const sections = filterNav(admin);

  const hrefFor = (to: string) => (to ? `/${lang}/${to}` : `/${lang}`);
  const isActive = (to: string) => {
    const href = hrefFor(to);
    return to ? pathname.startsWith(href) : pathname === href;
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border-light bg-surface">
      <div className="flex h-16 items-center border-b border-border-light px-5">
        <Link href={`/${lang}`} aria-label="Ekoru Admin">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.titleKey} className="mb-5">
            <Text variant="span" weight="semibold" size="sm" className="ml-2 mb-1">
              {t(`nav.${section.titleKey}`)}
            </Text>
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to);
                return (
                  <li key={item.labelKey}>
                    <Link
                      href={hrefFor(item.to)}
                      className={clsx(
                        "flex items-center gap-3 rounded-md px-3 py-2 font-sans text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-white"
                          : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground",
                      )}
                    >
                      <Icon size={18} strokeWidth={2} />
                      {t(`nav.${item.labelKey}`)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
