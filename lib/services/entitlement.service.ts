import { prisma } from "@/lib/prisma"

export const entitlementService = {
    async getActivePlan(userId: string) {
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: { in: ["ACTIVE", "TRIALING"] },
                currentPeriodEnd: { gte: new Date() },
            },
            include: {
                plan: {
                    include: {
                        features: true,
                        templates: true,
                    }
                }
            }
        });

        if (subscription) return subscription.plan;

        return prisma.plan.findUnique({
            where: { slug: "FREE" },
            include: {
                features: true,
                templates: true
            }
        });
    },

    async getFeatureValue(userId: string, key: string): Promise<string | null> {
        const plan = await this.getActivePlan(userId);
        const feature = plan?.features.find((f) => f.key === key);
        return feature?.value ?? null;
    },

    async canUserAccessTemplate(userId: string, templateId: string): Promise<boolean> {
        const plan = await this.getActivePlan(userId);
        return plan?.templates.some((t) => t.templateId === templateId) ?? false;
    },

    async getAllowedTemplateIds(userId: string): Promise<string[]> {
        const plan = await this.getActivePlan(userId);
        return plan?.templates.map((t) => t.templateId) ?? [];
    },

    async canCreateMoreCVs(userId: string): Promise<boolean> {
        const maxCvStr = await this.getFeatureValue(userId, "max_cv_count");
        const maxCv = parseInt(maxCvStr ?? "2");
        if (maxCv === -1) return true;

        const cvCount = await prisma.cV.count({
            where: { userId }
        });
        return cvCount < maxCv;
    },

    async canUseAi(userId: string): Promise<boolean> {
        const val = await this.getFeatureValue(userId, "ai_enhance");
        return val === "true";
    },

    async getMonthlyCredits(userId: string): Promise<number> {
        const val = await this.getFeatureValue(userId, "monthly_ai_credits");
        return parseInt(val ?? "0");
    }
}