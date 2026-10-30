import {
  BadgeCheck,
  Banknote,
  BarChart3,
  Boxes,
  Building2,
  Cloud,
  Coins,
  CreditCard,
  Droplet,
  FileText,
  FolderTree,
  Handshake,
  Layers,
  LayoutDashboard,
  Leaf,
  MapPin,
  Megaphone,
  MessagesSquare,
  Flag,
  Newspaper,
  Package,
  Package2,
  Percent,
  Receipt,
  Repeat,
  ScrollText,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  SpellCheck,
  Star,
  Store,
  Tags,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Wrench,
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
  /**
   * False while the screen does not exist yet, so the link is not shown
   * (ADM-10). Flip it when the page lands.
   */
  available?: boolean;
};

export type NavSection = {
  /** i18n key under the global `nav` namespace for the section heading. */
  titleKey: string;
  items: NavItem[];
};

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
        labelKey: "admins",
        to: "admins",
        icon: ShieldCheck,
        adminType: "PLATFORM",
        permission: "MANAGE_ADMINS",
      },
    ],
  },
  {
    titleKey: "gamification",
    items: [
      {
        labelKey: "sellerLabels",
        to: "seller-labels",
        icon: Tags,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
      {
        labelKey: "sellerLevels",
        to: "seller-levels",
        icon: TrendingUp,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
      {
        labelKey: "transactionPoints",
        to: "transaction-points",
        icon: Coins,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
      {
        labelKey: "transactionFees",
        to: "transaction-fees",
        icon: Percent,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
    ],
  },
  {
    titleKey: "memberships",
    items: [
      {
        labelKey: "memberships",
        to: "memberships",
        icon: CreditCard,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
      {
        labelKey: "membershipSubscriptions",
        to: "membership-subscriptions",
        available: true,
        icon: Receipt,
        adminType: "PLATFORM",
        permission: "VIEW_TRANSACTIONS",
      },
    ],
  },
  {
    titleKey: "geography",
    items: [
      {
        labelKey: "locations",
        to: "locations",
        icon: MapPin,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
    ],
  },
  {
    titleKey: "marketplace",
    items: [
      {
        labelKey: "departments",
        to: "departments",
        icon: FolderTree,
        adminType: "PLATFORM",
        permission: "MANAGE_CATEGORIES",
      },
      {
        labelKey: "departmentCategories",
        to: "department-categories",
        icon: Layers,
        adminType: "PLATFORM",
        permission: "MANAGE_CATEGORIES",
      },
      {
        labelKey: "productCategories",
        to: "product-categories",
        icon: Boxes,
        adminType: "PLATFORM",
        permission: "MANAGE_CATEGORIES",
      },
      {
        labelKey: "products",
        to: "products",
        icon: Package,
        adminType: "PLATFORM",
        permission: "MANAGE_PRODUCTS",
      },
    ],
  },
  {
    titleKey: "stores",
    items: [
      {
        labelKey: "storeCategories",
        to: "store-categories",
        icon: FolderTree,
        adminType: "PLATFORM",
        permission: "MANAGE_CATEGORIES",
      },
      {
        labelKey: "storeSubcategories",
        to: "store-subcategories",
        icon: Layers,
        adminType: "PLATFORM",
        permission: "MANAGE_CATEGORIES",
      },
      {
        labelKey: "storeProducts",
        to: "store-products",
        icon: Store,
        adminType: "PLATFORM",
        permission: "MANAGE_PRODUCTS",
      },
    ],
  },
  {
    titleKey: "services",
    items: [
      {
        labelKey: "serviceCategories",
        to: "service-categories",
        icon: FolderTree,
        adminType: "PLATFORM",
        permission: "MANAGE_CATEGORIES",
      },
      {
        labelKey: "serviceSubcategories",
        to: "service-subcategories",
        icon: Layers,
        adminType: "PLATFORM",
        permission: "MANAGE_CATEGORIES",
      },
      {
        labelKey: "services",
        to: "services",
        icon: Wrench,
        adminType: "PLATFORM",
        permission: "MANAGE_PRODUCTS",
      },
      {
        labelKey: "servicePackages",
        to: "service-packages",
        icon: Package2,
        adminType: "PLATFORM",
        permission: "MANAGE_PRODUCTS",
      },
      {
        labelKey: "quotations",
        to: "quotations",
        icon: FileText,
        adminType: "PLATFORM",
        permission: "MANAGE_ORDERS",
      },
      {
        labelKey: "serviceBookings",
        to: "service-bookings",
        icon: Handshake,
        adminType: "PLATFORM",
        permission: "MANAGE_ORDERS",
      },
      {
        labelKey: "providerCredentials",
        to: "provider-credentials",
        icon: BadgeCheck,
        adminType: "PLATFORM",
        permission: "VIEW_USER_DATA",
      },
    ],
  },
  {
    titleKey: "content",
    items: [
      {
        labelKey: "blogCategories",
        to: "blog-categories",
        icon: FolderTree,
        adminType: "PLATFORM",
        permission: "WRITE_BLOG",
      },
      {
        labelKey: "blogPosts",
        to: "blog-posts",
        icon: Newspaper,
        adminType: "PLATFORM",
        permission: "WRITE_BLOG",
      },
      {
        labelKey: "communityCategories",
        to: "community-categories",
        icon: FolderTree,
        adminType: "PLATFORM",
        permission: "MODERATE_CONTENT",
      },
      {
        labelKey: "communitySubcategories",
        to: "community-subcategories",
        icon: Layers,
        adminType: "PLATFORM",
        permission: "MODERATE_CONTENT",
      },
      {
        labelKey: "communityPosts",
        to: "community-posts",
        icon: MessagesSquare,
        adminType: "PLATFORM",
        permission: "MODERATE_CONTENT",
      },
      {
        labelKey: "communityReports",
        to: "community-reports",
        icon: Flag,
        adminType: "PLATFORM",
        permission: "MODERATE_CONTENT",
      },
    ],
  },
  {
    titleKey: "moderation",
    items: [
      {
        labelKey: "storeReviews",
        to: "store-reviews",
        icon: Star,
        adminType: "PLATFORM",
        permission: "MODERATE_CONTENT",
      },
      {
        labelKey: "serviceReviews",
        to: "service-reviews",
        icon: Star,
        adminType: "PLATFORM",
        permission: "MODERATE_CONTENT",
      },
    ],
  },
  {
    titleKey: "commerce",
    items: [
      {
        labelKey: "orders",
        to: "orders",
        icon: ShoppingCart,
        adminType: "PLATFORM",
        permission: "MANAGE_ORDERS",
      },
      {
        labelKey: "shippingStatuses",
        to: "shipping-statuses",
        icon: Truck,
        adminType: "PLATFORM",
        permission: "MANAGE_ORDERS",
      },
      {
        labelKey: "exchanges",
        to: "exchanges",
        icon: Repeat,
        adminType: "PLATFORM",
        permission: "VIEW_TRANSACTIONS",
      },
    ],
  },
  {
    titleKey: "payments",
    items: [
      {
        labelKey: "payments",
        to: "payments",
        icon: Wallet,
        adminType: "PLATFORM",
        permission: "VIEW_TRANSACTIONS",
      },
      {
        labelKey: "paymentConfigs",
        to: "payment-configs",
        icon: Banknote,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
    ],
  },
  {
    titleKey: "marketing",
    items: [
      {
        labelKey: "advertisements",
        to: "advertisements",
        icon: Megaphone,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
    ],
  },
  {
    titleKey: "communication",
    items: [
      {
        labelKey: "notificationTemplates",
        to: "notification-templates",
        icon: FileText,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
      {
        // Reported chat messages (ADM-14).
        labelKey: "chats",
        to: "chats",
        icon: MessagesSquare,
        adminType: "PLATFORM",
        permission: "MODERATE_CONTENT",
      },
    ],
  },
  {
    titleKey: "sustainability",
    items: [
      {
        labelKey: "materialImpacts",
        to: "material-impacts",
        icon: Leaf,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
      {
        labelKey: "waterImpactMessages",
        to: "water-impact-messages",
        icon: Droplet,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
      {
        labelKey: "co2ImpactMessages",
        to: "co2-impact-messages",
        icon: Cloud,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
    ],
  },
  {
    titleKey: "search",
    items: [
      {
        labelKey: "searchSynonyms",
        to: "search-synonyms",
        icon: Sparkles,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
      {
        labelKey: "searchCorrections",
        to: "search-corrections",
        icon: SpellCheck,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
      {
        labelKey: "searchSuggestions",
        to: "search-suggestions",
        icon: Search,
        adminType: "PLATFORM",
        permission: "MANAGE_SETTINGS",
      },
    ],
  },
  {
    titleKey: "system",
    items: [
      {
        labelKey: "adminActivity",
        to: "admin-activity",
        icon: ScrollText,
        adminType: "PLATFORM",
        permission: "VIEW_SYSTEM_LOGS",
      },
    ],
  },
  {
    titleKey: "businessArea",
    items: [
      {
        labelKey: "myBusiness",
        to: "my-business",
        icon: Building2,
        adminType: "BUSINESS",
      },
      {
        // Where the business connects the Mercado Pago account it is paid into (TRX-5).
        labelKey: "paymentSetup",
        to: "payment-setup",
        icon: Wallet,
        adminType: "BUSINESS",
      },
      {
        // The business's own figures (ADM-13/16); its dashboard is the home page.
        labelKey: "businessSales",
        to: "business-sales",
        icon: Receipt,
        adminType: "BUSINESS",
        permission: "VIEW_BUSINESS_ANALYTICS",
      },
      {
        labelKey: "businessProducts",
        to: "business-products",
        icon: BarChart3,
        adminType: "BUSINESS",
        permission: "VIEW_BUSINESS_ANALYTICS",
      },
      {
        labelKey: "businessSearch",
        to: "business-search",
        icon: Search,
        adminType: "BUSINESS",
        permission: "VIEW_BUSINESS_ANALYTICS",
      },
    ],
  },
];

const canSeeItem = (admin: Admin | null, item: NavItem): boolean => {
  if (!admin) return false;
  if (item.available === false) return false;
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
