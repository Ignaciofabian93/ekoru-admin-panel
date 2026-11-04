"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Download, FileSpreadsheet, Upload } from "lucide-react";
import { type SupportedLanguage } from "@/constants/settings";
import { Badge } from "@/components/Badge/Badge";
import MainButton from "@/components/Button/MainButton";
import { DataTable, type Column } from "@/components/DataTable/DataTable";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useTranslation } from "@/i18n/context";
import {
  cellErrorText,
  type CatalogKind,
  type ParsedRow,
  type RowOutcome,
} from "../catalog";
import { usePublishCatalog } from "../hooks/usePublishCatalog";
import { NAMESPACE } from "../i18n";

function Step({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
      <header className="flex flex-col gap-1">
        <Title level="h2" size="h5" weight="semibold">
          {title}
        </Title>
        <Text variant="small" color="secondary">
          {body}
        </Text>
      </header>
      {children}
    </section>
  );
}

/** One catalog (products or services): template, upload, check, publish, results. */
export function CatalogPublishCard({
  kind,
  lang,
}: {
  kind: CatalogKind;
  lang: SupportedLanguage;
}) {
  const { t } = useTranslation(NAMESPACE);
  const input = useRef<HTMLInputElement>(null);
  const {
    refsLoading,
    busy,
    file,
    results,
    downloadTemplate,
    downloadCatalog,
    chooseFile,
    publish,
    reset,
  } = usePublishCatalog(kind);

  const invalid = file?.rows.filter((r) => r.errors.length > 0) ?? [];
  const readyCount = (file?.rows.length ?? 0) - invalid.length;
  const count = (outcome: RowOutcome["outcome"]) =>
    results?.filter((r) => r.outcome === outcome).length ?? 0;
  // Rows that need something from the business: errors, and products saved
  // without a photo.
  const toReview =
    results?.filter((r) => r.outcome === "error" || r.outcome === "hidden") ?? [];

  const previewColumns: Column<ParsedRow>[] = [
    { key: "row", header: t("results.row"), render: (r) => r.rowNumber },
    { key: "name", header: t("results.name"), render: (r) => r.name || "—" },
    {
      key: "errors",
      header: t("results.outcome"),
      render: (r) => (
        <Text variant="small" color="secondary">
          {r.errors.map((e) => cellErrorText(t, kind, e)).join(" · ")}
        </Text>
      ),
    },
  ];

  const resultColumns: Column<RowOutcome>[] = [
    { key: "row", header: t("results.row"), render: (r) => r.rowNumber },
    { key: "name", header: t("results.name"), render: (r) => r.name || "—" },
    {
      key: "outcome",
      header: t("results.outcome"),
      render: (r) =>
        r.outcome === "error" ? (
          <Text variant="small" color="secondary">
            {r.message}
          </Text>
        ) : (
          <Badge tone="warning">
            {t("results.hiddenRow", { id: String(r.id ?? "") })}
          </Badge>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Step title={t("steps.templateTitle")} body={t("steps.templateBody")}>
        <div className="flex flex-wrap gap-2">
          <MainButton
            text={t("steps.template")}
            leftIcon={FileSpreadsheet}
            size="sm"
            loading={busy === "template"}
            disabled={refsLoading || busy !== null}
            onPress={() => void downloadTemplate()}
          />
          <MainButton
            text={t("steps.catalog")}
            leftIcon={Download}
            variant="secondary_outline"
            size="sm"
            loading={busy === "catalog"}
            disabled={refsLoading || busy !== null}
            onPress={() => void downloadCatalog()}
          />
        </div>
        <Text variant="small" color="tertiary">
          {refsLoading ? t("feedback.loadingRefs") : t("steps.catalogHint")}
        </Text>
      </Step>

      <Step title={t("steps.uploadTitle")} body={t("steps.uploadBody")}>
        <input
          ref={input}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const picked = e.target.files?.[0];
            e.target.value = "";
            if (picked) void chooseFile(picked);
          }}
        />

        {!file && !results && (
          <div>
            <MainButton
              text={t("steps.upload")}
              leftIcon={Upload}
              size="sm"
              loading={busy === "reading"}
              disabled={refsLoading || busy !== null}
              onPress={() => input.current?.click()}
            />
          </div>
        )}

        {file && (
          <div className="flex flex-col gap-3">
            <Text variant="span" weight="semibold">
              {t("preview.file", { name: file.name })}
            </Text>
            {file.rows.length === 0 ? (
              <Text variant="small" color="secondary">
                {t("preview.empty")}
              </Text>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Badge tone="success">
                  {t("preview.ready", { count: String(readyCount) })}
                </Badge>
                {invalid.length > 0 && (
                  <Badge tone="danger">
                    {t("preview.invalid", { count: String(invalid.length) })}
                  </Badge>
                )}
              </div>
            )}
            {invalid.length > 0 && (
              <DataTable
                columns={previewColumns}
                rows={invalid}
                rowKey={(r) => String(r.rowNumber)}
              />
            )}
            <div className="flex flex-wrap gap-2">
              <MainButton
                text={`${t("preview.publish")} (${readyCount})`}
                size="sm"
                loading={busy === "publishing"}
                disabled={readyCount === 0 || busy !== null}
                onPress={() => void publish()}
              />
              <MainButton
                text={t("preview.cancel")}
                variant="ghost"
                size="sm"
                disabled={busy !== null}
                onPress={reset}
              />
            </div>
          </div>
        )}

        {results && (
          <div className="flex flex-col gap-3">
            <Title level="h3" size="h6" weight="semibold">
              {t("results.title")}
            </Title>
            <div className="flex flex-wrap gap-2">
              <Badge tone="success">
                {t("results.created")}: {count("created") + count("hidden")}
              </Badge>
              <Badge tone="info">
                {t("results.updated")}: {count("updated")}
              </Badge>
              <Badge tone={count("error") ? "danger" : "neutral"}>
                {t("results.failed")}: {count("error")}
              </Badge>
            </div>
            {count("hidden") > 0 && (
              <div className="flex flex-col gap-2 rounded-md bg-background-tertiary p-3">
                <Text variant="small">{t("results.hidden")}</Text>
                <Link
                  href={`/${lang}/business-catalog?filter=noPhoto`}
                  className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  {t("results.openCatalog")}
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
            {toReview.length > 0 && (
              <DataTable
                columns={resultColumns}
                rows={toReview}
                rowKey={(r) => String(r.rowNumber)}
              />
            )}
            <div>
              <MainButton
                text={t("results.again")}
                leftIcon={Upload}
                variant="secondary_outline"
                size="sm"
                disabled={busy !== null}
                onPress={() => {
                  reset();
                  input.current?.click();
                }}
              />
            </div>
          </div>
        )}
      </Step>
    </div>
  );
}
