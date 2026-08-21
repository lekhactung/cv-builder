import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePlanSchema = z.object({
    name: z.string().min(1),
    description: z.string().nullable(),
    priceMonthly: z.number().min(0),
    priceYearly: z.number().min(0),
    isActive: z.boolean(),
    sortOrder: z.number().int(),
    features: z.array(z.object({
        key: z.string().min(1),
        value: z.string().min(1),
        label: z.string().nullable(),
    })),
    templates: z.array(z.string()),
});

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const parsed = updatePlanSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: "Dữ liệu không hợp lệ", details: parsed.error.issues }, { status: 400 });
        }

        const { name, description, priceMonthly, priceYearly, isActive, sortOrder, features, templates } = parsed.data;

        const updatedPlan = await prisma.$transaction(async (tx) => {
            const plan = await tx.plan.update({
                where: { id: params.id },
                data: {
                    name,
                    description,
                    priceMonthly,
                    priceYearly,
                    isActive,
                    sortOrder,
                },
            });

            await tx.planFeature.deleteMany({ where: { planId: plan.id } });
            if (features.length > 0) {
                await tx.planFeature.createMany({
                    data: features.map(f => ({ ...f, planId: plan.id })),
                });
            }

            await tx.planTemplate.deleteMany({ where: { planId: plan.id } });
            if (templates.length > 0) {
                await tx.planTemplate.createMany({
                    data: templates.map(t => ({ templateId: t, planId: plan.id })),
                });
            }

            return plan;
        });

        await prisma.auditLog.create({
            data: {
                action: "PLAN_UPDATED",
                adminId: session.user.id,
                description: `Admin updated plan ${name}`,
                metadata: { planId: params.id, changes: parsed.data } as any,
            }
        });

        return NextResponse.json({ success: true, plan: updatedPlan });
    } catch (error: any) {
        console.error("[ADMIN_UPDATE_PLAN]", error);
        return NextResponse.json({ error: "Lỗi khi cập nhật gói" }, { status: 500 });
    }
}
