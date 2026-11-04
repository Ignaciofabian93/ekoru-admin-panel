"use client";

import { useBusinessKinds } from "@/features/businessPublish/hooks/useBusinessKinds";
import { useAdmin } from "@/store/useAuthStore";
import { filterNav } from "../constants/nav";

/**
 * The menu the signed-in admin may open. A business's items also follow what
 * it offers: a store doesn't see bookings, a service business doesn't see
 * orders (WEB-22). Until the business type loads, both show.
 */
export function useNavSections() {
  const admin = useAdmin();
  const { kinds } = useBusinessKinds();
  return filterNav(admin, kinds);
}
