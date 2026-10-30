"use client";

import { BarList, ChartCard, formatCount } from "@/components/Charts";
import type { SupportedLanguage } from "@/constants/settings";
import { useTranslation } from "@/i18n/context";
import { useBusinessSearch } from "../hooks/useAnalytics";
import { useAnalyticsRange } from "../hooks/useAnalyticsRange";
import type { SearchTerm } from "../types";
import { AnalyticsFrame, PrivacyNote } from "./AnalyticsFrame";

/**
 * How people reach the business: where its views come from, the searches that
 * led to its listings, and what EKORU users search for, found or not.
 */
export function BusinessSearchScreen({ lang }: { lang: SupportedLanguage }) {
  const { t } = useTranslation("analytics");
  const { range, setRange } = useAnalyticsRange();
  const { data, loading, error } = useBusinessSearch(range);

  const count = (v: number) => formatCount(v, lang);
  const terms = (
    list: SearchTerm[],
    show: (s: SearchTerm) => string,
    pick = "searches",
  ) =>
    list.map((s) => ({
      key: s.query,
      label: s.query,
      value: pick === "clicks" ? s.clicks : s.searches,
      display: show(s),
    }));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <AnalyticsFrame
        title={t("search.title")}
        subtitle={t("search.subtitle")}
        range={range}
        onRangeChange={setRange}
        ready={data !== null}
        failed={!!error && data === null}
      >
        {data && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard
                title={t("search.sources.title")}
                subtitle={t("search.sources.subtitle")}
                busy={loading}
              >
                <BarList
                  emptyLabel={t("common.noData")}
                  items={data.viewsBySource.map((s) => ({
                    key: s.key,
                    label: t(`search.sourceNames.${s.key}`),
                    value: s.count,
                    display: t("common.views", { views: count(s.count) }),
                  }))}
                />
              </ChartCard>

              <ChartCard
                title={t("search.foundBy.title")}
                subtitle={t("search.foundBy.subtitle")}
                busy={loading}
              >
                <BarList
                  emptyLabel={t("common.noData")}
                  items={terms(
                    data.foundBy,
                    (s) => t("common.clicks", { clicks: count(s.clicks) }),
                    "clicks",
                  )}
                />
              </ChartCard>

              <ChartCard
                title={t("search.top.title")}
                subtitle={t("search.top.subtitle")}
                busy={loading}
              >
                <BarList
                  emptyLabel={t("common.noData")}
                  items={terms(data.topSearches, (s) =>
                    t("common.searchesAndClicks", {
                      searches: count(s.searches),
                      clicks: count(s.clicks),
                    }),
                  )}
                />
              </ChartCard>

              <ChartCard
                title={t("search.unmet.title")}
                subtitle={t("search.unmet.subtitle")}
                busy={loading}
              >
                <BarList
                  emptyLabel={t("common.noData")}
                  items={terms(data.unmetSearches, (s) =>
                    t("common.searches", { searches: count(s.searches) }),
                  )}
                />
              </ChartCard>
            </div>
            <PrivacyNote />
          </div>
        )}
      </AnalyticsFrame>
    </div>
  );
}
