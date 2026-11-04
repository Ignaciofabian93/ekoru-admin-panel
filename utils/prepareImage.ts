/**
 * Why a picked photo can't go up, named like the gateway's refusals so one
 * message map words both.
 */
export type ImageRefusal =
  | "IMAGE_FORMAT"
  | "IMAGE_TOO_HEAVY"
  | "IMAGE_TOO_LARGE"
  | "IMAGE_UNREADABLE";

export class ImageRefusedError extends Error {
  constructor(readonly code: ImageRefusal) {
    super(`Image refused: ${code}`);
    this.name = "ImageRefusedError";
  }
}

/** The gateway's and the image processor's byte limit. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** The image processor's pixel limit per side. */
const MAX_SOURCE_SIDE = 10_000;

/** Longest side of a re-encoded photo; above the 1920 px the processor keeps. */
const RESIZE_SIDE = 3000;

/** Formats sent as they are; the processor reads them and keeps transparency. */
const SENT_AS_IS = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Makes a picked photo one the server accepts, or says why it can't, as the
 * web app does (`utils/imageUpload.ts` there). A JPEG, PNG or WebP within the
 * limits goes as it is. Anything else the browser can read (a heavy camera
 * photo, HEIC on Safari, AVIF, GIF…) is redrawn as a JPEG of at most 3000 px.
 */
export async function prepareImage(file: File): Promise<File> {
  if (file.type && !file.type.startsWith("image/")) {
    throw new ImageRefusedError("IMAGE_FORMAT");
  }
  // Without createImageBitmap (very old browsers) the server decides.
  if (typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    if (!SENT_AS_IS.has(file.type)) throw new ImageRefusedError("IMAGE_FORMAT");
    if (file.size > MAX_IMAGE_BYTES) throw new ImageRefusedError("IMAGE_TOO_HEAVY");
    // A format the server reads, within its limit: the server has the last word.
    return file;
  }

  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    if (
      SENT_AS_IS.has(file.type) &&
      file.size <= MAX_IMAGE_BYTES &&
      longest <= MAX_SOURCE_SIDE
    ) {
      return file;
    }

    const scale = Math.min(1, RESIZE_SIDE / longest);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new ImageRefusedError("IMAGE_UNREADABLE");
    // JPEG has no transparency; white is what a transparent logo sits on.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) throw new ImageRefusedError("IMAGE_UNREADABLE");
    if (blob.size > MAX_IMAGE_BYTES) throw new ImageRefusedError("IMAGE_TOO_HEAVY");

    const name = `${file.name.replace(/\.[^.]*$/, "") || "image"}.jpg`;
    return new File([blob], name, { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
}
