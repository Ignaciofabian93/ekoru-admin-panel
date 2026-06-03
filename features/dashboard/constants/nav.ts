import {
  FileText,
  FolderTree,
  LayoutDashboard,
  MessagesSquare,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Admin } from "@/types/admin";
import type { AdminPermission, AdminType } from "@/types/enums";
import { hasPermission } from "@/utils/permissions";

export type NavItem = {
  /** i18n key under the global `nav` namespace. */
  labelKey: string;
  /** Path relative to `/[lang]` (empty string = dashboard home). */
  to: string;
  icon: LucideIcon;
  /** Restrict to a single admin type. Omit = visible to both. */
  adminType?: AdminType;
  /** Require this permission to see the item (SUPER_ADMIN always passes). */
  permission?: AdminPermission;
};

export type NavSection = {
  /** i18n key under the global `nav` namespace for the section heading. */
  titleKey: string;
  items: NavItem[];
};

/**
 * The full navigation map. `filterNav()` narrows it to what a given admin may
 * see, so PLATFORM (Ekoru) admins get the management/content/taxonomy sections
 * while BUSINESS admins only get their own business area.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    titleKey: "overview",
    items: [{ labelKey: "overview", to: "", icon: LayoutDashboard }],
  },
  {
    titleKey: "management",
    items: [
      {
        labelKey: "users",
        to: "users",
        icon: Users,
        adminType: "PLATFORM",
        permission: "MANAGE_USERS",
      },
      {
        labelKey: "taxonomy",
        to: "categories",
        icon: FolderTree,
        adminType: "PLATFORM",
        permission: "MANAGE_CATEGORIES",
      },
    ],
  },
  {
    titleKey: "content",
    items: [
      {
        labelKey: "blog",
        to: "blog",
        icon: FileText,
        adminType: "PLATFORM",
        permission: "WRITE_BLOG",
      },
      {
        labelKey: "community",
        to: "community",
        icon: MessagesSquare,
        adminType: "PLATFORM",
        permission: "MODERATE_CONTENT",
      },
    ],
  },
  {
    titleKey: "businessArea",
    items: [
      {
        labelKey: "myBusiness",
        to: "my-business",
        icon: Store,
        adminType: "BUSINESS",
      },
    ],
  },
];

const canSeeItem = (admin: Admin | null, item: NavItem): boolean => {
  if (!admin) return false;
  if (item.adminType && admin.adminType !== item.adminType) return false;
  if (item.permission && !hasPermission(admin, item.permission)) return false;
  return true;
};

/** Returns only the sections/items the given admin is allowed to navigate to. */
export const filterNav = (admin: Admin | null): NavSection[] =>
  NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canSeeItem(admin, item)),
  })).filter((section) => section.items.length > 0);
