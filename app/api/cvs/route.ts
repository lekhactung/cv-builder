import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CvDataSchema } from "@/lib/schemas/cv.schema";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const cv = await prisma.cV.create({
        data: {
            title: (body.title ?? "CV Không Tiêu Đề").toString().trim().slice(0, 100),
            template: body.template ?? "Modern",
            data: CvDataSchema.parse({}).valueOf() as object,
            userId: session.user.id,
        },
    })
    return NextResponse.json({cv}, {status : 201})
}