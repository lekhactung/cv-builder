import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
    NextResponse.json({ cv })
}

export async function PATCH(req: Request, { params }: Params) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { id } = await params;
    const body = await req.json();

    const allowedFields: Record<string, unknown> = {};
    if (body.title !== undefined) allowedFields.title = body.title;
    if (body.data !== undefined) allowedFields.data = body.data;
    if (body.template !== undefined) allowedFields.template = body.template;

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