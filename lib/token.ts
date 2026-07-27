import { prisma } from "@/lib/prisma";

export const generatedPasswordResetToken = async (email : string ) => {
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000) ;

    const existingToken = await prisma.passwordResetToken.findFirst({
        where: { email }
    });

    if(existingToken) {
        await prisma.passwordResetToken.delete({
            where : {id: existingToken.id}
        });
    }

    const passwordResetToken = await prisma.passwordResetToken.create({
        data : {
            email,
            token,
            expires,
        }
    });

    return passwordResetToken;
}