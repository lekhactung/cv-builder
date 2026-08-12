"use server"
import { prisma } from "@/lib/prisma"
import { createHash } from "crypto"
import bcrypt from "bcryptjs"

export const updatePassword = async (email: string, code: string, newPassword: string) => {
    const hashedCode = createHash("sha256").update(code).digest("hex");
    const existingToken = await prisma.passwordResetToken.findFirst({
        where: { email, token: hashedCode }
    });

    if (!existingToken) {
        return { error: "Mã xác nhận không hợp lệ!" };
    }

    
    if (!newPassword || newPassword.length < 6) {
        return { error: "Mật khẩu phải có ít nhất 6 ký tự!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
        return { error: "Mã xác nhận đã hết hạn!" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    });

    await prisma.passwordResetToken.delete({
        where: { id: existingToken.id }
    })
    return { success: "Cập nhật mật khẩu thành công!" };
}