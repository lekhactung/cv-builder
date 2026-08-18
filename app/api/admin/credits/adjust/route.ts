import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { creditService } from "@/lib/services/credit.service";
import { auditService } from "@/lib/services/audit.service";
import { z } from "zod";

const adjustSchema = z.object({
    userId: z.string().min(1),
    amount: z.number().int().refine((n) => n !== 0, "Amount cannot be 0"),
    description: z.string().min(1, "Description is required"),
})

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = adjustSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { userId, amount, description } = parsed.data;

    try {
        await creditService.adminAdjust(userId, amount, description, session.user.id);

        await auditService.log({
            action: "ADMIN_CREDIT_ADJUSTMENT",
            userId,
            adminId: session.user.id,
            description: `Admin adjusted ${amount > 0 ? "+" : ""} ${amount} credits : ${description}`,
            metadata: { amount, description },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.message === "INSUFFICIENT_CREDITS") {
            return NextResponse.json({ error: "User không đủ credits để trừ" }, { status: 400 });
        }
        console.error("[ADMIN_ADJUST_ERROR]", error);
        return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
    }
}