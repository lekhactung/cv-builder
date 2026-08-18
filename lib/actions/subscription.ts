"use server";

import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { subscriptionService } from "@/lib/services/subscription.service";
import { auditService } from "@/lib/services/audit.service";
import { prisma } from "@/lib/prisma";


export async function cancelSubscriptionAction() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Chưa đăng nhập");

    const sub = await subscriptionService.getActiveSubcriptiion(session.user.id);
    if (!sub) throw new Error("Không có subscription active");

    if (sub.providerSubscriptionId && sub.provider === "STRIPE") {
        await stripe.subscriptions.update(
            sub.providerSubscriptionId,
            { cancel_at_period_end: true }
        )
    }

    await subscriptionService.cancelAtPeriodEnd(session.user.id);

    await auditService.log({
        action: "SUBSCRIPTION_CANCELLED",
        userId: session.user.id,
        description: `User cancelled subscription at period end`,
        metadata: { subscriptionId: sub.id },
    });

    return { success: true };

}

export async function getMySubscriptionAction() {
    const session = await auth();
    if (!session?.user?.id) return null;

    return subscriptionService.getSubcription(session.user.id);
}