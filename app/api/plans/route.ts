import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const plans = await prisma.plan.findMany({
            where: { isActive: true },
            include: {
                features: { orderBy: { key: "asc" } },
                templates: true,
            },
            orderBy: { sortOrder: "asc" },
        });

        return NextResponse.json({ plans });
    } catch (error) {
        console.error("[GET /api/plans]", error);
        return NextResponse.json(
            { error: "Không thể tải danh sách plans" },
            { status: 500 }
        );
    }
}
