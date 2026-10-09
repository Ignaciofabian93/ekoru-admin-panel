"use client";

import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import Select from "@/components/Select/Select";
import { type SupportedLanguage } from "@/constants/settings";
import {
  GET_RAW_COMMUNITY_CATEGORIES,
  GET_RAW_COMMUNITY_SUB_CATEGORIES,
} from "@/graphql/blogCommunity/queries";
import { useTranslation } from "@/i18n/context";

type Translation = { language: string; name: string };
type CategoryRow = { id: number; isActive: boolean; translations: Translation[] };
type SubCategoryRow = CategoryRow & { communityCategoryId: number };

/** Name in the panel's language, falling back to Spanish, then any. */
const nameIn = (translations: Translation[], lang: string) =>
  (
    translations.find((t) => t.language === lang.toUpperCase()) ??
    translations.find((t) => t.language === "ES") ??
    translations[0]
  )?.name ?? "—";

/**
 * Community category → subcategory for an event. The subcategory decides
 * which /community page lists the event; only active ones can be chosen
 * (the subgraph refuses the rest).
 */
export function EventCategoryPicker({
  categoryId,
  subCategoryId,
  onChange,
}: {
  categoryId?: number;
  subCategoryId?: number;
  onChange: (next: { categoryId?: number; subCategoryId?: number }) => void;
}) {
  const { t } = useTranslation("communityEvents");
  const { lang = "es" } = useParams<{ lang?: SupportedLanguage }>();

  const { data: categories } = useQuery<{
    rawCommunityCategories: { nodes: CategoryRow[] };
  }>(GET_RAW_COMMUNITY_CATEGORIES, { variables: { page: 1, pageSize: 200 } });
  const { data: subcategories } = useQuery<{
    rawCommunitySubCategories: { nodes: SubCategoryRow[] };
  }>(GET_RAW_COMMUNITY_SUB_CATEGORIES, {
    variables: { page: 1, pageSize: 500, communityCategoryId: categoryId },
    skip: categoryId === undefined,
  });

  const categoryOptions = (categories?.rawCommunityCategories.nodes ?? [])
    .filter((c) => c.isActive)
    .map((c) => ({ value: String(c.id), label: nameIn(c.translations, lang) }));
  const subcategoryOptions = (subcategories?.rawCommunitySubCategories.nodes ?? [])
    .filter((s) => s.isActive)
    .map((s) => ({ value: String(s.id), label: nameIn(s.translations, lang) }));

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Select
        name="communityCategoryId"
        label={t("fields.category")}
        options={categoryOptions}
        value={categoryId !== undefined ? String(categoryId) : undefined}
        onChangeValue={(v) =>
          onChange({ categoryId: Number(v), subCategoryId: undefined })
        }
      />
      <Select
        name="communitySubCategoryId"
        label={t("fields.subcategory")}
        options={subcategoryOptions}
        value={subCategoryId !== undefined ? String(subCategoryId) : undefined}
        disabled={categoryId === undefined}
        onChangeValue={(v) => onChange({ categoryId, subCategoryId: Number(v) })}
      />
    </div>
  );
}
