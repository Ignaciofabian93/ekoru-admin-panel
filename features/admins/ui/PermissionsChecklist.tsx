"use client";

import { Checkbox } from "@/components/Checkbox/Checkbox";
import { Text } from "@/components/Text/Text";
import { useTranslation } from "@/i18n/context";
import type { AdminPermission } from "@/types/enums";
import { ADMIN_PERMISSION_GROUPS } from "../constants";

/** Grouped checklist of admin permissions, used by the create/edit form and detail editor. */
export function PermissionsChecklist({
  value,
  onChange,
}: {
  value: AdminPermission[];
  onChange: (value: AdminPermission[]) => void;
}) {
  const { t } = useTranslation("admins");

  const toggle = (perm: AdminPermission, checked: boolean) => {
    const next = new Set(value);
    if (checked) next.add(perm);
    else next.delete(perm);
    onChange([...next]);
  };

  return (
    <div className="flex flex-col gap-4">
      {ADMIN_PERMISSION_GROUPS.map((group) => (
        <div key={group.group} className="flex flex-col gap-2">
          <Text variant="small" color="tertiary" weight="semibold">
            {t(`permissionGroups.${group.group}`)}
          </Text>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {group.permissions.map((perm) => (
              <Checkbox
                key={perm}
                label={t(`permissions.${perm}`)}
                checked={value.includes(perm)}
                onChange={(checked) => toggle(perm, checked)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
