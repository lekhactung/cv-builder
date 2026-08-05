import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CvDataSchema } from "@/lib/schemas/cv.schema";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params;
    const cv = await prisma.cV.findFirst({
        where: { id, userId: session.user.id }
    });

    if (!cv) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ cv })
}

export async function PATCH(req: Request, { params }: Params) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params;
    const body = await req.json();

    const allowedFields: Record<string, unknown> = {};
    if (body.title !== undefined) {
        allowedFields.title = String(body.title).trim().slice(0, 100);
    }
    if (body.data !== undefined) {
        allowedFields.data = CvDataSchema.parse(body.data).valueOf() as object;
    }
    if (body.template !== undefined) {
        allowedFields.template = String(body.template).trim().slice(0, 50);
    }

    const cv = await prisma.cV.updateMany({
        where: { id, userId: session.user.id },
        data: allowedFields,
    });
    return NextResponse.json({ cv })
}

export async function DELETE(req: Request, { params }: Params) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params;
    await prisma.cV.deleteMany({ where: { id, userId: session.user.id } });
    return NextResponse.json({ success: true });
}