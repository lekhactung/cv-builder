"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CvDataSchema } from "../schemas/cv.schema";
import { auth } from "@/auth";
import { CvDocumentSchema } from "../schemas/block.schema";
import { Prisma } from "@prisma/client";

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
    initialTitle: string = "CV Không Tiêu Đề"
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");

    const isDocument = initialData && typeof initialData === 'object' && 'columns' in initialData;
    const result = isDocument ? CvDocumentSchema.safeParse(initialData) : CvDataSchema.safeParse(initialData);

    if (!result.success) {
        throw new Error("Dữ liệu CV không hợp lệ");
    }

    const validatedData = result.data;

    const cv = await prisma.cV.create({
        data: {
            title: initialTitle,
            template: templateId,
            data: validatedData as Prisma.InputJsonValue,
            userId: session.user.id,
        }
    })
    return cv.id;
}


export async function updateCvAction(id: string, data: unknown, title: string, template?: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");

    const isDocument = data && typeof data === 'object' && 'columns' in data;
    const validatedData = isDocument ? CvDocumentSchema.parse(data) : CvDataSchema.parse(data);
    const validTitle = typeof title === "string" ? title.trim().slice(0, 100) : "CV Không Tiêu Đề";

    await prisma.cV.update({
        where: {
            id: id,
            userId: session.user.id
        },
        data: {
            data: validatedData as Prisma.InputJsonValue,
            title: validTitle,
            ...(template && { template })
        },
    });

    return { success: true }
}

export async function getCvAction(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");
    const cv = await prisma.cV.findUnique({ where: { id, userId: session.user.id } })
    if (!cv) return null

    const rawData = cv.data as Record<string, unknown>
    if (rawData.columns) {
        const doc = CvDocumentSchema.parse(rawData)
        return { ...cv, document: doc, isBlockBased: true }
    }
    return null
}