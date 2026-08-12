import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

export const generatedPasswordResetToken = async (email: string) => {
    const rawToken = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

    const existingToken = await prisma.passwordResetToken.findFirst({
        where: { email }
    });

    if (existingToken) {
        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id }
        });
    }

    await prisma.passwordResetToken.create({
        data: {
            email,
            token: hashedToken,
            expires,
        }
    });

    return rawToken;
}