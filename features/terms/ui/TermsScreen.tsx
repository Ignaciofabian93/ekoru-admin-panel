"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { Input } from "@/components/Input/Input";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Text } from "@/components/Text/Text";
import Textarea from "@/components/Textarea/Textarea";
import { Title } from "@/components/Title/Title";
import { type SupportedLanguage } from "@/constants/settings";
import {
  DELETE_TERMS_DRAFT,
  PUBLISH_TERMS_VERSION,
  SAVE_TERMS_DRAFT,
  TERMS_VERSIONS,
} from "@/graphql/terms/queries";
import { useToast } from "@/hooks/useToast";
import { useTranslation } from "@/i18n/context";
import { formatDate } from "@/utils/formatters";
import { NAMESPACE } from "../i18n";
import { hasClauseTitle, parseTerms } from "../parseTerms";

const LANGUAGES = ["ES", "EN", "FR"] as const;
type Lang = (typeof LANGUAGES)[number];
type Texts = Record<Lang, { title: string; content: string }>;

interface TermsVersion {
  id: number;
  version: number;
  summary: string | null;
  publishedAt: string | null;
  isCurrent: boolean;
  acceptanceCount: number;
  translations: { id: number; language: string; title: string; content: string }[];
}

interface Draft {
  id?: number;
  version: number;
  summary: string;
  texts: Texts;
  dirty: boolean;
}

const textsOf = (v?: TermsVersion): Texts =>
  Object.fromEntries(
    LANGUAGES.map((l) => {
      const x = v?.translations.find((tr) => tr.language === l);
      return [l, { title: x?.title ?? "", content: x?.content ?? "" }];
    }),
  ) as Texts;

/**
 * Terms and Policies (LEG-1): every version, the open draft and publishing.
 * A published version never changes; a new one starts from the text in force
 * and reaches no one until it is published, when every account is asked to
 * accept it.
 */
export function TermsScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation(NAMESPACE);
  const { t: tc } = useTranslation();
  const toast = useToast();
  const apiLanguage = lang.toUpperCase();

  const { data, loading, refetch } = useQuery<{ termsVersions: TermsVersion[] }>(
    TERMS_VERSIONS,
    { fetchPolicy: "network-only" },
  );
  const [save, { loading: saving }] = useMutation<{ saveTermsDraft: TermsVersion }>(
    SAVE_TERMS_DRAFT,
  );
  const [publish, { loading: publishing }] = useMutation(PUBLISH_TERMS_VERSION);
  const [remove, { loading: deleting }] = useMutation(DELETE_TERMS_DRAFT);

  const versions = useMemo(() => data?.termsVersions ?? [], [data]);
  const savedDraft = versions.find((v) => !v.publishedAt);
  const current = versions.find((v) => v.isCurrent);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [viewing, setViewing] = useState<TermsVersion | null>(null);
  const [tab, setTab] = useState<Lang>("ES");

  // The open draft is edited in place; a new one starts from the text in force.
  const editing: Draft | null =
    draft ??
    (savedDraft
      ? {
          id: savedDraft.id,
          version: savedDraft.version,
          summary: savedDraft.summary ?? "",
          texts: textsOf(savedDraft),
          dirty: false,
        }
      : null);

  const update = (change: Partial<Draft>) =>
    editing && setDraft({ ...editing, ...change, dirty: true });
  const setText = (field: "title" | "content", value: string) =>
    editing &&
    update({
      texts: { ...editing.texts, [tab]: { ...editing.texts[tab], [field]: value } },
    });

  // The API's refusal says what to fix (e.g. a draft already open).
  const fail = (err: unknown) =>
    toast.error(err instanceof Error && err.message ? err.message : tc("common.error"));

  const startNew = () => {
    const next = Math.max(0, ...versions.map((v) => v.version)) + 1;
    setViewing(null);
    setTab("ES");
    setDraft({ version: next, summary: "", texts: textsOf(current), dirty: true });
  };

  const problems = (d: Draft): string | null => {
    if (!d.texts.ES.title.trim() || !d.texts.ES.content.trim())
      return t("spanishRequired");
    const bad = LANGUAGES.find(
      (l) => d.texts[l].content.trim() && !hasClauseTitle(d.texts[l].content),
    );
    return bad ? `${bad}: ${t("missingTitle")}` : null;
  };

  const handleSave = async () => {
    if (!editing) return;
    const problem = problems(editing);
    if (problem) return toast.error(problem);
    try {
      await save({
        variables: {
          language: apiLanguage,
          input: {
            id: editing.id,
            summary: editing.summary.trim() || undefined,
            translations: LANGUAGES.filter((l) => editing.texts[l].content.trim()).map(
              (l) => ({
                language: l,
                title: editing.texts[l].title.trim() || editing.texts.ES.title.trim(),
                content: editing.texts[l].content,
              }),
            ),
          },
        },
      });
      toast.success(t("saved"));
      setDraft(null);
      await refetch();
    } catch (err) {
      fail(err);
    }
  };

  const handlePublish = async () => {
    if (!editing?.id || editing.dirty) return toast.error(t("unsaved"));
    if (!window.confirm(t("publishConfirm", { version: String(editing.version) })))
      return;
    try {
      await publish({ variables: { id: editing.id, language: apiLanguage } });
      toast.success(t("published", { version: String(editing.version) }));
      setDraft(null);
      await refetch();
    } catch (err) {
      fail(err);
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    if (!editing.id) return setDraft(null);
    if (!window.confirm(t("deleteConfirm", { version: String(editing.version) }))) return;
    try {
      await remove({ variables: { id: editing.id, language: apiLanguage } });
      toast.success(t("deleted"));
      setDraft(null);
      await refetch();
    } catch (err) {
      fail(err);
    }
  };

  const statusOf = (v: TermsVersion) =>
    !v.publishedAt
      ? t("statuses.draft")
      : v.isCurrent
        ? t("statuses.current")
        : t("statuses.previous");

  const columns: Column<TermsVersion>[] = [
    { key: "version", header: t("version"), render: (v) => `v${v.version}` },
    {
      key: "status",
      header: t("status"),
      render: (v) => (
        <span
          className={clsx(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            v.isCurrent && "bg-primary/10 text-primary",
            !v.publishedAt && "bg-amber-100 text-amber-800",
            v.publishedAt && !v.isCurrent && "bg-neutral-100 text-neutral-600",
          )}
        >
          {statusOf(v)}
        </span>
      ),
    },
    {
      key: "publishedAt",
      header: t("publishedAt"),
      render: (v) => (v.publishedAt ? formatDate(v.publishedAt, lang) : "—"),
    },
    {
      key: "acceptances",
      header: t("acceptances"),
      align: "right",
      render: (v) => v.acceptanceCount.toLocaleString(lang),
    },
    {
      key: "actions",
      header: "",
      render: (v) =>
        v.publishedAt ? (
          <div className="flex justify-end">
            <MainButton
              text={t("view")}
              variant="outline"
              size="sm"
              onPress={() => {
                setViewing(v);
                setTab("ES");
              }}
            />
          </div>
        ) : null,
    },
  ];

  const shown = viewing ? textsOf(viewing) : editing?.texts;
  const preview = shown ? parseTerms(shown[tab].content) : [];

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="MANAGE_SETTINGS"
      fallback={<AccessDenied />}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-1">
          <Title level="h1" size="h3" weight="bold">
            {t("title")}
          </Title>
          <Text variant="p" color="secondary">
            {t("subtitle")}
          </Text>
        </header>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Title level="h2" size="h5" weight="semibold">
              {t("versions")}
            </Title>
            {!editing && (
              <div className="flex flex-col items-end gap-1">
                <MainButton text={t("newVersion")} size="sm" onPress={startNew} />
                <Text variant="small" color="secondary">
                  {t("newVersionHint")}
                </Text>
              </div>
            )}
          </div>
          <DataTable
            columns={columns}
            rows={versions}
            loading={loading}
            rowKey={(v) => String(v.id)}
            emptyLabel={t("empty")}
          />
        </section>

        {(editing || viewing) && shown && (
          <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Title level="h2" size="h5" weight="semibold">
                {viewing
                  ? t("viewing", { version: String(viewing.version) })
                  : editing?.id
                    ? t("editingDraft", { version: String(editing.version) })
                    : t("newDraft", { version: String(editing?.version ?? "") })}
              </Title>
              {viewing && (
                <MainButton
                  text={t("close")}
                  variant="ghost"
                  size="sm"
                  onPress={() => setViewing(null)}
                />
              )}
            </div>

            {!viewing && editing && (
              <Textarea
                name="summary"
                label={t("summary")}
                hint={t("summaryHint")}
                value={editing.summary}
                onChangeText={(v) => update({ summary: v })}
                rows={2}
                maxLength={1000}
              />
            )}

            <div role="tablist" className="flex gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  type="button"
                  role="tab"
                  aria-selected={tab === l}
                  onClick={() => setTab(l)}
                  className={clsx(
                    "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                    tab === l
                      ? "bg-primary text-white"
                      : "bg-neutral-100 text-neutral-700",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                {viewing ? (
                  <Text variant="p" weight="semibold">
                    {shown[tab].title || "—"}
                  </Text>
                ) : (
                  <>
                    <Input
                      name="title"
                      label={t("docTitle")}
                      value={shown[tab].title}
                      onChangeText={(v) => setText("title", v)}
                      maxLength={200}
                    />
                    <Textarea
                      name="content"
                      label={t("content")}
                      hint={t("contentHint")}
                      value={shown[tab].content}
                      onChangeText={(v) => setText("content", v)}
                      rows={24}
                      className="font-mono text-xs"
                    />
                  </>
                )}
                {tab !== "ES" && !shown[tab].content.trim() && (
                  <Text variant="small" color="secondary">
                    {t("emptyLanguage")}
                  </Text>
                )}
              </div>

              <div className="flex max-h-168 flex-col gap-2 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <Text variant="small" weight="semibold" color="secondary">
                  {t("preview")}
                </Text>
                {preview.map((b, i) =>
                  b.kind === "HEADING" ? (
                    <Title key={i} level="h3" size="h6" weight="bold" className="mt-3">
                      {b.text}
                    </Title>
                  ) : b.kind === "SUBHEADING" ? (
                    <Text key={i} variant="p" weight="semibold" className="mt-1">
                      {b.text}
                    </Text>
                  ) : b.kind === "LIST_ITEM" ? (
                    <Text key={i} variant="p" color="secondary" className="pl-4">
                      • {b.text}
                    </Text>
                  ) : (
                    <Text key={i} variant="p" color="secondary">
                      {b.text}
                    </Text>
                  ),
                )}
              </div>
            </div>

            {!viewing && editing && (
              <div className="flex flex-wrap justify-end gap-2">
                <MainButton
                  text={t("deleteDraft")}
                  variant="error"
                  size="md"
                  loading={deleting}
                  onPress={() => void handleDelete()}
                />
                <MainButton
                  text={t("save")}
                  variant="outline"
                  size="md"
                  loading={saving}
                  onPress={() => void handleSave()}
                />
                <MainButton
                  text={t("publish")}
                  size="md"
                  loading={publishing}
                  disabled={!editing.id || editing.dirty}
                  onPress={() => void handlePublish()}
                />
              </div>
            )}
            {!viewing && editing && (!editing.id || editing.dirty) && (
              <Text variant="small" color="secondary" className="text-right">
                {t("unsaved")}
              </Text>
            )}
          </section>
        )}
      </div>
    </PermissionGate>
  );
}
