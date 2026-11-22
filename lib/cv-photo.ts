export type CvPhotoPosition = { x: number; y: number };

/** Keep the translated 80px portrait inside the unscaled CV page. */
export function clampCvPhotoPosition(
  position: CvPhotoPosition,
  origin: CvPhotoPosition,
  page: { width: number; height: number },
): CvPhotoPosition {
  return {
    x: Math.round(Math.max(-origin.x, Math.min(page.width - 80 - origin.x, position.x))),
    y: Math.round(Math.max(-origin.y, Math.min(page.height - 80 - origin.y, position.y))),
  };
}

/** Prepare a small, persistent image for the CV's existing avatarUrl field. */
export async function prepareCvPhoto(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Vui lòng chọn ảnh JPG, PNG hoặc WebP.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ảnh tải lên không được vượt quá 5 MB.");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    // ponytail: store a capped portrait in CV JSON; use object storage for full-resolution photos.
    canvas.width = canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Không thể xử lý ảnh. Vui lòng thử lại.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, 512, 512);
    const side = Math.min(bitmap.width, bitmap.height);
    context.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      512,
      512,
    );
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    if (!dataUrl.startsWith("data:image/jpeg;base64,") || dataUrl.length > 256 * 1024) {
      throw new Error("Ảnh sau xử lý quá lớn. Vui lòng chọn ảnh khác.");
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}
