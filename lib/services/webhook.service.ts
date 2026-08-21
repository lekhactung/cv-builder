import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { creditService } from "./credit.service"
import { auditService } from "./audit.service"
import Stripe from "stripe"

export const webhookService = {
    async processStripeEvent(event: Stripe.Event) {
        switch (event.type) {
            case "checkout.session.completed":
                await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case "customer.subscription.updated":
                await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
                break;

            case "customer.subscription.deleted":
                await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;

            case "invoice.payment_failed":
                await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
                break;

            case "invoice.payment_succeeded":
                await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
                break;

            default:
                console.log(`[WEBHOOK] Unhandled event: ${event.type}`);
        }
    },
    async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
        if (session.mode != "subscription") return;

        const paymentId = session.metadata?.paymentId;
        const userId = session.metadata?.userId;

        if (!paymentId || !userId) {
            console.error("[WEBHOOK] Missing metadata in checkout session", session.id);
            return;
        }

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { plan: { include: { features: true } } },
        })

        if (!payment) {
            console.error("[WEBHOOK] Payment not found:", paymentId);
            return;
        }
        if (payment.status === "COMPLETED") {
            console.log("[WEBHOOK] Already processed, skipping:", paymentId);
            return;
        }

        //lay subcription tu stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );
        //db transaction
        await prisma.$transaction(async (tx) => {
            await tx.payment.update({
                where: { id: paymentId },
                data: {
                    status: "COMPLETED",
                    paidAt: new Date(),
                    providerPaymentId: stripeSubscription.id,
                },
            });
            //create/ upd subcription   //cap credit
            await tx.subscription.upsert({
                where: { userId },
                create: {
                    userId,
                    planId: payment.planId!,
                    status: "ACTIVE",
                    provider: "STRIPE",
                    providerSubscriptionId: stripeSubscription.id,
                    billingInterval: stripeSubscription.items.data[0].price.recurring?.interval === "year" ? "YEARLY" : "MONTHLY",
                    currentPeriodStart: new Date(stripeSubscription.items.data[0].current_period_start * 1000),
                    currentPeriodEnd: new Date(stripeSubscription.items.data[0].current_period_end * 1000),
                },
                update: {
                    planId: payment.planId!,
                    status: "ACTIVE",
                    providerSubscriptionId: stripeSubscription.id,
                    billingInterval: stripeSubscription.items.data[0].price.recurring?.interval === "year" ? "YEARLY" : "MONTHLY",
                    currentPeriodStart: new Date(stripeSubscription.items.data[0].current_period_start * 1000),
                    currentPeriodEnd: new Date(stripeSubscription.items.data[0].current_period_end * 1000),
                    cancelAtPeriodEnd: false,
                },
            });

            //cap credit
            const creditFeature = payment.plan?.features.find((f) => f.key === "monthly_ai_credits");

            const credits = parseInt(creditFeature?.value ?? "0");

            if (credits > 0) {
                const wallet = await tx.creditWallet.upsert({
                    where: { userId },
                    create: { userId, balance: credits },
                    update: { balance: { increment: credits } }
                })

                await tx.creditTransaction.create({
                    data: {
                        walletId: wallet.id,
                        type: "SUBSCRIPTION_GRANT",
                        amount: credits,
                        balanceBefore: wallet.balance - credits,
                        balanceAfter: wallet.balance,
                        description: `${payment.plan?.name} plan activated`,
                        referenceId: paymentId,
                    },
                });
            }

            //audit log
            await tx.auditLog.create({
                data: {
                    action: "PAYMENT_COMPLETED",
                    userId,
                    description: `Payment completed : ${paymentId}. Credits granted : ${credits}`,
                    metadata: { paymentId, credits, planId: payment.planId } as any
                },
            });
        });
        console.log(`[WEBHOOK] Payment completed: ${paymentId}, credits: ${userId}`);
    },

    async handleSubscriptionUpdated(sub: Stripe.Subscription) {
        const dbSub = await prisma.subscription.findUnique({
            where: { providerSubscriptionId: sub.id },
        });

        if (!dbSub) {
            console.log("[WEBHOOK] Subscription not found in DB:", sub.id);
            return;
        }

        const isActive = ["active", "trialing"].includes(sub.status);

        await prisma.subscription.update({
            where: { id: dbSub.id },
            data: {
                status: isActive ? "ACTIVE" : "PAST_DUE",
                currentPeriodStart: new Date(sub.items.data[0].current_period_start * 1000),
                currentPeriodEnd: new Date(sub.items.data[0].current_period_end * 1000),
                cancelAtPeriodEnd: sub.cancel_at_period_end,

            }
        })
    },

    async handleSubscriptionDeleted(sub: Stripe.Subscription) {
        const dbSub = await prisma.subscription.findUnique({
            where: { providerSubscriptionId: sub.id },
        });

        if (!dbSub) return;

        await prisma.$transaction(async (tx) => {
            await tx.subscription.update({
                where: { id: dbSub.id },
                data: { status: "EXPIRED" },
            });
            await tx.auditLog.create({
                data: {
                    action: "SUBSCRIPTION_EXPIRED",
                    userId: dbSub.userId,
                    description: `Subcription expired : ${sub.id}`,
                    metadata: { subcriptionId: sub.id } as any,
                }
            });
        });
    },

    async handlePaymentFailed(invoice: Stripe.Invoice) {
        if (!invoice.customer) return;

        const sub = await prisma.subscription.findFirst({
            where: {
                user: {
                    //todo : tìm user qua stripeCustomerId - lưu khi tạo customer
                }
            }
        });
        console.warn(`[WEBHOOK] Payment failed for customer: ${invoice.customer} `);
        //todo : gửi mail thông báo qua resend ()
    },

    async handlePaymentSucceeded(invoice: Stripe.Invoice) {
        if (invoice.billing_reason !== "subscription_cycle") {
            return;
        }

        const subscriptionId = (invoice as any).subscription as string;
        if (!subscriptionId) return;

        const dbSub = await prisma.subscription.findUnique({
            where: { providerSubscriptionId: subscriptionId },
            include: { plan: { include: { features: true } } }
        });

        if (!dbSub || !dbSub.plan) {
            console.error("[WEBHOOK] Subscription or Plan not found for invoice:", invoice.id);
            return;
        }

        const creditFeature = dbSub.plan.features.find((f) => f.key === "monthly_ai_credits");
        const credits = parseInt(creditFeature?.value ?? "0");

        await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    userId: dbSub.userId,
                    planId: dbSub.planId,
                    subscriptionId: dbSub.id,
                    amount: invoice.amount_paid,
                    currency: invoice.currency.toUpperCase(),
                    status: "COMPLETED",
                    provider: "STRIPE",
                    providerPaymentId: invoice.id,
                    paidAt: new Date(),
                }
            });

            if (credits > 0) {
                const wallet = await tx.creditWallet.upsert({
                    where: { userId: dbSub.userId },
                    create: { userId: dbSub.userId, balance: credits },
                    update: { balance: { increment: credits } }
                });

                await tx.creditTransaction.create({
                    data: {
                        walletId: wallet.id,
                        type: "SUBSCRIPTION_GRANT",
                        amount: credits,
                        balanceBefore: wallet.balance - credits,
                        balanceAfter: wallet.balance,
                        description: `Auto-renewal: ${dbSub.plan!.name} plan`,
                        referenceId: payment.id,
                    },
                });
            }

            await tx.auditLog.create({
                data: {
                    action: "PAYMENT_COMPLETED",
                    userId: dbSub.userId,
                    description: `Auto-renewal completed: ${invoice.id}. Credits granted: ${credits}`,
                    metadata: { paymentId: payment.id, invoiceId: invoice.id, credits, planId: dbSub.planId } as any
                }
            });
        });

        console.log(`[WEBHOOK] Auto-renewal processed for sub: ${subscriptionId}, credits: ${credits}`);
    }
}