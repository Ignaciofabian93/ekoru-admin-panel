"use client";

import {
  Boxes,
  FolderTree,
  Layers,
  MessagesSquare,
  Newspaper,
  ShoppingBag,
  Store,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { type SupportedLanguage } from "@/constants/settings";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { NAMESPACE } from "../i18n";

interface CatalogGroup {
  key: string;
  icon: LucideIcon;
  links: { key: string; to: string; icon: LucideIcon }[];
}

/**
 * Every catalog already has its own category CRUD screen, each reachable from
 * the sidebar. This page does not duplicate them — it is the one place that
 * shows the whole taxonomy at a glance and hands off to the right editor, which
 * is what an admin looking for "categories" actually wants.
 */
const GROUPS: CatalogGroup[] = [
  {
    key: "marketplace",
    icon: ShoppingBag,
    links: [
      { key: "departments", to: "departments", icon: FolderTree },
      { key: "departmentCategories", to: "department-categories", icon: Layers },
      { key: "productCategories", to: "product-categories", icon: Boxes },
    ],
  },
  {
    key: "stores",
    icon: Store,
    links: [
      { key: "storeCategories", to: "store-categories", icon: FolderTree },
      { key: "storeSubcategories", to: "store-subcategories", icon: Layers },
    ],
  },
  {
    key: "services",
    icon: Wrench,
    links: [
      { key: "serviceCategories", to: "service-categories", icon: FolderTree },
      { key: "serviceSubcategories", to: "service-subcategories", icon: Layers },
    ],
  },
  {
    key: "content",
    icon: Newspaper,
    links: [
      { key: "blogCategories", to: "blog-categories", icon: FolderTree },
      { key: "communityCategories", to: "community-categories", icon: MessagesSquare },
      { key: "communitySubcategories", to: "community-subcategories", icon: Layers },
    ],
  },
];

export function CategoriesHub({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation(NAMESPACE);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <Title level="h1" size="h3" weight="bold">
          {t("title")}
        </Title>
        <Text variant="p" color="secondary">
          {t("subtitle")}
        </Text>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {GROUPS.map((group) => {
          const GroupIcon = group.icon;
          return (
            <section
              key={group.key}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-background-tertiary text-foreground-secondary">
                  <GroupIcon size={18} />
                </span>
                <Title level="h2" size="h6" weight="semibold">
                  {t(`groups.${group.key}`)}
                </Title>
              </div>

              <ul className="flex flex-col">
                {group.links.map((link) => {
                  const LinkIcon = link.icon;
                  return (
                    <li key={link.key}>
                      <Link
                        href={`/${lang}/${link.to}`}
                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-background-tertiary"
                      >
                        <LinkIcon size={16} className="text-foreground-tertiary" />
                        {t(`links.${link.key}`)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
