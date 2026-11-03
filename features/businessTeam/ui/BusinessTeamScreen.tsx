"use client";

import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import { useAdmin } from "@/store/useAuthStore";
import { formatDate, humanizeEnum } from "@/utils/formatters";
import { BUSINESS_PERMISSIONS } from "@/utils/permissions";
import { useBusinessTeam } from "../hooks/useBusinessTeam";
import { NAMESPACE } from "../i18n";
import type { BusinessTeamMember } from "../types";
import { MemberForm } from "./MemberForm";

/**
 * Business area → Equipo (USR-15). The owner, or an account with the team
 * permission, adds people up to the plan's accounts, changes what they can do
 * and turns them off and on. The owner's account and your own are read-only
 * here; EKORU can still change any account in Administradores.
 */
export function BusinessTeamScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation(NAMESPACE);
  const me = useAdmin();
  const { team, loading, saving, inviteMember, updateMember, setActive, resendInvite } =
    useBusinessTeam();
  // "new" for the add form, a member id while editing one.
  const [editing, setEditing] = useState<string | null>(null);

  const seats = team?.seats ?? 0;
  const used = team?.used ?? 0;
  const full = used >= seats;
  const editable = (m: BusinessTeamMember) =>
    m.role !== "BUSINESS_OWNER" && m.id !== me?.id;
  const editingMember = team?.members.find((m) => m.id === editing);

  const columns: Column<BusinessTeamMember>[] = [
    {
      key: "member",
      header: t("columns.member"),
      render: (m) => (
        <div className="flex flex-col">
          <Text variant="span" weight="semibold">
            {[m.name, m.lastName].filter(Boolean).join(" ")}
            {m.id === me?.id && ` · ${t("status.you")}`}
          </Text>
          <Text variant="small" color="secondary">
            {m.email}
          </Text>
        </div>
      ),
    },
    {
      key: "role",
      header: t("columns.role"),
      render: (m) => (
        <Badge tone={m.role === "BUSINESS_OWNER" ? "primary" : "neutral"}>
          {t(`roles.${m.role}`)}
        </Badge>
      ),
    },
    {
      key: "permissions",
      header: t("columns.permissions"),
      render: (m) => (
        <Text variant="small" color="secondary">
          {m.role === "BUSINESS_OWNER"
            ? t("status.allPermissions")
            : BUSINESS_PERMISSIONS.filter((p) => m.permissions.includes(p))
                .map((p) => t(`permissions.${p}`))
                .join(", ") || "—"}
        </Text>
      ),
    },
    {
      key: "status",
      header: t("columns.status"),
      render: (m) => (
        <div className="flex flex-wrap gap-1">
          <Badge tone={m.isActive ? "success" : "neutral"}>
            {t(m.isActive ? "status.active" : "status.inactive")}
          </Badge>
          {m.isActive && !m.hasSeat && <Badge tone="warning">{t("status.noSeat")}</Badge>}
          {m.isActive && !m.lastLoginAt && (
            <Badge tone="info">{t("status.pending")}</Badge>
          )}
        </div>
      ),
    },
    {
      key: "lastLogin",
      header: t("columns.lastLogin"),
      render: (m) => (
        <Text variant="small" color="secondary">
          {formatDate(m.lastLoginAt, lang)}
        </Text>
      ),
    },
    {
      key: "actions",
      header: t("columns.actions"),
      align: "right",
      render: (m) =>
        editable(m) ? (
          <div className="flex flex-wrap justify-end gap-1">
            <MainButton
              text={t("actions.edit")}
              variant="ghost"
              size="sm"
              onPress={() => setEditing(m.id)}
            />
            {m.isActive && !m.lastLoginAt && (
              <MainButton
                text={t("actions.resend")}
                variant="ghost"
                size="sm"
                disabled={saving}
                onPress={() => void resendInvite(m.id, m.email)}
              />
            )}
            <MainButton
              text={t(m.isActive ? "actions.turnOff" : "actions.turnOn")}
              variant={m.isActive ? "outline" : "secondary_outline"}
              size="sm"
              disabled={saving || (!m.isActive && full)}
              onPress={() => void setActive(m.id, !m.isActive)}
            />
          </div>
        ) : null,
    },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Title level="h1" size="h3" weight="bold">
            {t("title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("subtitle")}
          </Text>
        </div>
        <MainButton
          text={t("actions.add")}
          leftIcon={UserPlus}
          size="sm"
          disabled={loading || full || editing !== null}
          onPress={() => setEditing("new")}
        />
      </header>

      <section className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-surface p-5">
        <span className="flex size-11 items-center justify-center rounded-lg bg-background-tertiary text-foreground-secondary">
          <Users size={20} />
        </span>
        <div className="flex flex-col">
          <Text variant="small" color="secondary">
            {t("seats.label")}
          </Text>
          <Title level="h2" size="h4" weight="bold">
            {loading ? "—" : `${used} / ${seats}`}
          </Title>
        </div>
        {team && (
          <Badge tone="primary">
            {t("seats.plan", { plan: humanizeEnum(team.plan) })}
          </Badge>
        )}
        {team && used > seats ? (
          <Text variant="small" color="secondary" className="basis-full">
            {t("seats.over")}
          </Text>
        ) : (
          team &&
          full && (
            <Text variant="small" color="secondary" className="basis-full">
              {t("seats.full")}
            </Text>
          )
        )}
      </section>

      {editing === "new" && (
        <MemberForm
          saving={saving}
          onSubmit={inviteMember}
          onCancel={() => setEditing(null)}
        />
      )}
      {editingMember && (
        <MemberForm
          // Re-mount per member so the fields start from their values.
          key={editingMember.id}
          member={editingMember}
          saving={saving}
          onSubmit={(draft) => updateMember(editingMember.id, draft)}
          onCancel={() => setEditing(null)}
        />
      )}

      <DataTable
        columns={columns}
        rows={team?.members ?? []}
        rowKey={(m) => m.id}
        loading={loading}
        emptyLabel={t("feedback.empty")}
      />
    </div>
  );
}
