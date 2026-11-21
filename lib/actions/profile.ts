"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ProfileActionState = { error?: string; success?: string };

const nameSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập tên hiển thị.")
  .max(80, "Tên không được quá 80 ký tự.");
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại.").max(72),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới cần ít nhất 8 ký tự.")
      .max(72, "Mật khẩu không được quá 72 ký tự."),
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Mật khẩu xác nhận chưa khớp.",
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
  });

export async function updateProfileAction(formData: FormData): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id || session.error) return { error: "Vui lòng đăng nhập lại." };

  const name = nameSchema.safeParse(formData.get("name"));
  if (!name.success) return { error: name.error.issues[0].message };

  const avatar = formData.get("avatar");
  let image: string | null | undefined;
  if (formData.get("removeAvatar") === "true") image = null;
  if (avatar instanceof File && avatar.size > 0) {
    if (avatar.size > 256 * 1024) return { error: "Ảnh sau xử lý không được vượt quá 256 KB." };
    const bytes = Buffer.from(await avatar.arrayBuffer());
    const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const webp =
      bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
    const mime = png ? "image/png" : jpeg ? "image/jpeg" : webp ? "image/webp" : null;
    if (!mime) return { error: "Chỉ hỗ trợ ảnh PNG, JPG hoặc WebP." };
    // ponytail: avatars are capped at 256 KB in User.image; use object storage if image volume grows.
    image = `data:${mime};base64,${bytes.toString("base64")}`;
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.data, ...(image !== undefined ? { image } : {}) },
    });
    revalidatePath("/profile");
    revalidatePath("/dashboard", "layout");
    return { success: "Đã lưu thông tin tài khoản." };
  } catch {
    return { error: "Không thể lưu thay đổi. Vui lòng thử lại." };
  }
}

export async function changePasswordAction(formData: FormData): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id || session.error) return { error: "Vui lòng đăng nhập lại." };
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { currentPassword, newPassword } = parsed.data;
  if (
    Buffer.byteLength(newPassword, "utf8") > 72 ||
    Buffer.byteLength(currentPassword, "utf8") > 72
  ) {
    return { error: "Mật khẩu không được vượt quá 72 byte." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });
    if (!user?.password)
      return { error: "Tài khoản này sử dụng đăng nhập Google, chưa có mật khẩu riêng." };
    if (!(await bcrypt.compare(currentPassword, user.password)))
      return { error: "Mật khẩu hiện tại không chính xác." };
    const password = await bcrypt.hash(newPassword, 12);
    const updated = await prisma.user.updateMany({
      where: { id: session.user.id, password: user.password },
      data: { password },
    });
    if (!updated.count)
      return { error: "Mật khẩu đã thay đổi ở một phiên khác. Vui lòng thử lại." };
    return { success: "Đã đổi mật khẩu thành công." };
  } catch {
    return { error: "Không thể đổi mật khẩu. Vui lòng thử lại." };
  }
}
