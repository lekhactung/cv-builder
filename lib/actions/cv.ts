"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CvDataSchema } from "../schemas/cv.schema";
import { auth } from "@/auth";
import { id } from "zod/locales";
import { success } from "zod";


export async function deleteCvAction(id: string) {
    try {
        await prisma.cV.delete({
            where: { id },
        });

        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Lỗi khi xóa CV:", error);
        return { success: false, error: "Không thể xóa CV" };
    }
}

export async function createCvAction() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");

    const cv = await prisma.cV.create({
        data: {
            title: "CV Không Tiêu Đề",
            template: "Modern",
            data: CvDataSchema.parse({}) as object,
            userId: session.user.id,
        }
    })
    return cv.id;
}

export async function updateCvAction(id: string, data: any, title: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");

    await prisma.cV.update({
        where: {
            id: id,
            userId: session.user.id
        },
        data: {
            data: data,
            title: title,
        },
    });

    return { success: true }
}