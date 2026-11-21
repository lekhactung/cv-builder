/** Keep uploaded image data out of the session cookie. */
export function profileImageUrl(image: string | null, updatedAt: Date): string | null {
  return image?.startsWith("data:image/") ? `/api/profile/avatar?v=${updatedAt.getTime()}` : image;
}
