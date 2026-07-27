"use server"
import { prisma } from "@/lib/prisma"
import { generatedPasswordResetToken } from "@/lib//token"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY);

export const resetPassword = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
        return { error: "Email không tồn tại hoặc đăng nhâp bằng bên thứ 3!" }
    }

    const passwordResetToken = await generatedPasswordResetToken(email);

    const resetLink = `${process.env.AUTH_URL}/auth/new-password?token=${passwordResetToken.token}`;
    try {
        await resend.emails.send({
            from: "CV Builder <onboarding@resend.dev>",
            to: email,
            subject: "Mã xác nhận đặt lại mật khẩu",
            html: `
                <h2>Xin chào,</h2>
                <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản CV Builder.</p>
                <p>Mã xác nhận của bạn là: <strong style="font-size: 24px; color: #7C3AED;">${passwordResetToken.token}</strong></p>
                <p>Mã này sẽ hết hạn sau 15 phút.</p>
            `
        })

        return {
            success: "Đã gửi mã xác nhận đến email của bạn!"
        };
    } catch (error) {
        console.error(error);

        return {
            error: "Không thể gửi email."
        };
    }
}