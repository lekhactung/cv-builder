import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const plans = await prisma.plan.findMany({
            include: {
                features: true,
                templates: true,
            },
            orderBy: {
                sortOrder: "asc",
            },
        });

        return NextResponse.json({ plans });
    } catch (error) {
        console.error("[ADMIN_GET_PLANS]", error);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}
