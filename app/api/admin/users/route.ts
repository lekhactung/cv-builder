import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const pageSize = 20;

    const where = search
        ? {
            OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
            ],
        }
        : {};

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            include: {
                subscription: { include: { plan: true } },
                creditWallet: true,
                _count: { select: { cvs: true } },
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.user.count({ where })
    ]);

    return NextResponse.json({ users, total, page, pageSize });
}