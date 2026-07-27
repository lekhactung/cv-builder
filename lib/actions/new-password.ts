"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const updatePassword = async (email: string, code: string, newPassword: string) => {
    const existingToken = await prisma.passwordResetToken.findFirst({
        where: { email, token: code }
    });

    if (!existingToken) {
        return { error: "Mã xác nhận không hợp lệ!" };
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