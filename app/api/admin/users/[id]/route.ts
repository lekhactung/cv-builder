import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditService } from "@/lib/services/audit.service";
import { z } from "zod";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user) return null;
    if (session.user.role !== "ADMIN") return null;
    return session;
}

// GET /api/admin/users/[id]
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            subscription: { include: { plan: true } },
            creditWallet: {
                include: {
                    transactions: {
                        orderBy: { createdAt: "desc" },
                        take: 10,
                    },
                },
            },
            payments: {
                orderBy: { createdAt: "desc" },
                take: 10,
                include: { plan: true },
            },
            auditLogs: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            _count: { select: { cvs: true } },
        },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
}

// PATCH /api/admin/users/[id] — update role
const patchSchema = z.object({
    role: z.enum(["USER", "ADMIN"]),
});

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const { role } = parsed.data;

    const updated = await prisma.user.update({
        where: { id },
        data: { role },
    });

    await auditService.log({
        action: "USER_ROLE_CHANGED",
        userId: id,
        adminId: session.user.id,
        description: `Role changed to ${role}`,
        metadata: { role },
    });

    return NextResponse.json({ success: true, role: updated.role });
}
