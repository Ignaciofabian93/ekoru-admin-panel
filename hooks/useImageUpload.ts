"use client";

import { useState } from "react";

type UploadResponse = { imageUrl?: string; key?: string; message?: string };

/**
 * Uploads a single image to the same-origin asset proxy (`/api/images/asset`),
 * which forwards it to the gateway → image-processor → R2 and returns the public
 * CDN URL. Used for blog and event cover images; the returned URL is stored in
 * the entity's `coverImage` via a GraphQL mutation.
 *
 * `entityId` namespaces the R2 key (e.g. "blog", "event").
 */
export function useImageUpload(entityId: string) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      body.append("entityId", entityId);

      const res = await fetch("/api/images/asset", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as UploadResponse;
      if (!res.ok || !data.imageUrl) return null;
      return data.imageUrl;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading };
}
