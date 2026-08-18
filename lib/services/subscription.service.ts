import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";

export const subscriptionService = {
    async getActiveSubcriptiion(userId: string) {
        return prisma.subscription.findFirst({
            where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
            include:
            {
                plan: {
                    include:
                        { features: true }
                }
            },
        })
    },

    async getSubcription(userId: string) {
        return prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        })
    },

    async cancelAtPeriodEnd(userId: string) {
        return prisma.subscription.update({
            where: { userId },
            data: {
                cancelAtPeriodEnd: true,
                cancelledAt: new Date(),
            }
        })
    },

    async expireSubcription(subscriptionId: string) {
        return prisma.subscription.update({
            where: { id: subscriptionId },
            data: { status: "EXPIRED" }
        })
    }
}