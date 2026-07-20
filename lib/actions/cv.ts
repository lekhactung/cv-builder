"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { CvDataSchema } from "../schemas/cv.schema";
import { auth } from "@/auth";
import { success } from "zod";


export async function deleteCvAction(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");
    try {
        const deleted = await prisma.cV.deleteMany({
            where: { id, userId: session.user.id },
        });

        if (deleted.count === 0) {
            return { success: false, error: "CV không tồn tại hoặc không có quyền" }
        }
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Lỗi khi xóa CV:", error);
        return { success: false, error: "Không thể xóa CV" };
    }
}

export async function createCvAction(
    templateId: string,
    initialData: unknown = {},
    inititalTitle: string = "CV Không Tiêu Đề"
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");

    const validatedData = CvDataSchema.parse(initialData);

    const cv = await prisma.cV.create({
        data: {
            title: "CV Không Tiêu Đề",
            template: templateId,
            data: CvDataSchema.parse({}) as object,
            userId: session.user.id,
        }
    })
    return cv.id;
}


export async function updateCvAction(id: string, data: unknown, title: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");

    const validatedData = CvDataSchema.parse(data)

    await prisma.cV.update({
        where: {
            id: id,
            userId: session.user.id
        },
        data: {
            data: validatedData as object,
            title: title,
        },
    });

    return { success: true }
}