"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { type SupportedLanguage } from "@/constants/settings";
import { AccessDenied } from "@/components/AccessDenied/AccessDenied";
import MainButton from "@/components/Button/MainButton";
import { Checkbox } from "@/components/Checkbox/Checkbox";
import { FormShell } from "@/components/FormShell/FormShell";
import { ImageUploadField } from "@/components/ImageUploadField/ImageUploadField";
import { PermissionGate } from "@/components/PermissionGate/PermissionGate";
import { Select } from "@/components/Select/Select";
import { Text } from "@/components/Text/Text";
import { Title } from "@/components/Title/Title";
import { useNavigation } from "@/hooks/useNavigation";
import { useTranslation } from "@/i18n/context";
import { useBlogCategoryOptions, useBlogPost } from "../hooks/useBlogPosts";
import { useBlogPostMutations } from "../hooks/useBlogPostMutations";
import { type BlogPost } from "../types";
import {
  BlogTranslationsEditor,
  type BlogTranslationSavePayload,
} from "./BlogTranslationsEditor";

function BlogPostForm({
  lang,
  post,
  onSaved,
}: {
  lang: SupportedLanguage;
  post: BlogPost | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation("blogPosts");
  const { t: tc } = useTranslation();
  const { navigateTo } = useNavigation();
  const { options: categoryOptions, loading: optionsLoading } = useBlogCategoryOptions();
  const {
    loading,
    createPost,
    updatePost,
    deletePost,
    upsertTranslation,
    deleteTranslation,
  } = useBlogPostMutations();

  const listRoute = `/${lang}/blog-posts`;

  const [blogCategoryId, setBlogCategoryId] = useState(
    post ? String(post.blogCategoryId) : "",
  );
  const [coverImage, setCoverImage] = useState<string | null>(post?.coverImage ?? null);
  const [isPublished, setIsPublished] = useState(post?.isPublished ?? false);

  const saveBase = async () => {
    if (!blogCategoryId) return;
    if (post) {
      const ok = await updatePost(post.id, {
        blogCategoryId: Number(blogCategoryId),
        coverImage,
        isPublished,
      });
      if (ok) onSaved();
      return;
    }
    const id = await createPost({
      blogCategoryId: Number(blogCategoryId),
      coverImage,
      isPublished,
    });
    // Jump to the edit screen so translations can be added to the new post.
    if (id != null) navigateTo({ route: `/${lang}/blog-posts/${id}/edit` });
  };

  const saveTranslation = async (payload: BlogTranslationSavePayload) => {
    if (!post) return;
    const ok = await upsertTranslation({ ...payload, blogPostId: post.id });
    if (ok) onSaved();
  };

  const removeTranslation = async (language: string) => {
    if (!post) return;
    if (await deleteTranslation(post.id, language)) onSaved();
  };

  const removePost = async () => {
    if (!post) return;
    if (!window.confirm(t("deleteConfirm"))) return;
    if (await deletePost(post.id)) navigateTo({ route: listRoute });
  };

  return (
    <FormShell
      backHref={listRoute}
      backLabel={t("actions.backToList")}
      title={post ? t("editTitle", { id: String(post.id) }) : t("newTitle")}
      subtitle={t("formSubtitle")}
      actions={
        post ? (
          <MainButton
            text={tc("common.delete")}
            leftIcon={Trash2}
            variant="outline"
            size="sm"
            disabled={loading}
            onPress={removePost}
          />
        ) : undefined
      }
    >
      <section className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-5 shadow-sm">
        <Title level="h2" size="h6" weight="semibold">
          {t("sections.baseData")}
        </Title>

        <ImageUploadField
          label={t("fields.coverImage")}
          entityId="blog"
          value={coverImage}
          onChange={setCoverImage}
        />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Select
            label={t("fields.category")}
            placeholder={optionsLoading ? tc("common.loading") : undefined}
            value={blogCategoryId}
            options={categoryOptions}
            onChangeValue={setBlogCategoryId}
          />
        </div>

        <Checkbox
          name="isPublished"
          label={t("fields.published")}
          checked={isPublished}
          onChange={setIsPublished}
        />

        <div className="flex justify-end">
          <MainButton
            text={tc("common.save")}
            size="sm"
            loading={loading}
            disabled={!blogCategoryId}
            onPress={() => void saveBase()}
          />
        </div>
      </section>

      {post ? (
        <BlogTranslationsEditor
          translations={post.translations}
          saving={loading}
          onSave={saveTranslation}
          onDelete={removeTranslation}
        />
      ) : (
        <Text variant="small" color="tertiary">
          {t("translations.saveBaseFirst")}
        </Text>
      )}
    </FormShell>
  );
}

/** Create (no id) or edit (id) screen for a blog post. */
export function BlogPostFormScreen({
  lang,
  id,
}: {
  lang: SupportedLanguage;
  id?: number;
}) {
  const { t } = useTranslation("blogPosts");
  const { t: tc } = useTranslation();
  const isEdit = id != null;
  const { post, loading, refetch } = useBlogPost(id ?? Number.NaN);

  if (isEdit && loading && !post) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {tc("common.loading")}
        </Text>
      </div>
    );
  }

  if (isEdit && !loading && !post) {
    return (
      <div className="py-20 text-center">
        <Text variant="p" color="tertiary">
          {t("notFound")}
        </Text>
      </div>
    );
  }

  return (
    <PermissionGate
      adminType="PLATFORM"
      permission="WRITE_BLOG"
      fallback={<AccessDenied />}
    >
      <BlogPostForm
        key={post ? `${post.id}-${post.updatedAt}` : "new"}
        lang={lang}
        post={post}
        onSaved={() => void refetch()}
      />
    </PermissionGate>
  );
}
