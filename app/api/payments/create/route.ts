import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod"

const createPaymentSchema = z.object({
    planId: z.string().min(1),
    billingInterval: z.enum(["MONTHLY", "YEARLY"]),
});

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = createPaymentSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
        }

        const { planId, billingInterval } = parsed.data;

        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan || !plan.isActive) {
            return NextResponse.json({ error: "Gói không tồn tại" }, { status: 404 });
        }

        if (plan.slug === "FREE") {
            return NextResponse.json({ error: "Gói Free không cần thanh toán" }, { status: 400 });
        }

        const stripePriceId = billingInterval === "MONTHLY" ? plan.stripePriceIdMonthly : plan.stripePriceIdYearly;
        if (!stripePriceId) {
            return NextResponse.json({ error: "Chưa cấu hình Stripe Price ID cho gói này trong Database" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user) {
            return NextResponse.json({ error: "User không tồn tại" }, { status: 400 });
        }

        let stripeCustomerId: string | undefined;
        const lastPayment = await prisma.payment.findFirst({
            where: { userId: user.id, provider: "STRIPE" },
            orderBy: { createdAt: "desc" }
        })

        if (lastPayment?.providerSessionId) {
            try {
                const existingSession = await stripe.checkout.sessions.retrieve(
                    lastPayment.providerSessionId
                );
                stripeCustomerId = existingSession.customer as string;
            } catch {

            }
        }

        if (!stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.email!,
                name: user.name ?? undefined,
                metadata: { userId: user.id },
            });
            stripeCustomerId = customer.id;
        }

        const payment = await prisma.payment.create({
            data: {
                userId: user.id,
                planId: plan.id,
                amount: billingInterval === "MONTHLY" ? plan.priceMonthly : plan.priceYearly,
                currency: "VND",
                status: "PENDING",
                provider: "STRIPE",
            },
        });

        const appUrl = process.env.AUTH_URL;

        const checkoutSession = await stripe.checkout.sessions.create({
            customer: stripeCustomerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: stripePriceId, quantity: 1 }],
            success_url: `${appUrl}/payment/result?status=success`,
            cancel_url: `${appUrl}/payment/result?status=cancelled`,
            metadata: {
                paymentId: payment.id,
                userId: user.id,
            },
            allow_promotion_codes: true,
        });

        await prisma.payment.update({
            where: { id: payment.id },
            data: { providerSessionId: checkoutSession.id },
        })

        return NextResponse.json({ checkoutUrl: checkoutSession.url });
    } catch (error) {
        console.error("[CREATE_PAYMENT_ERROR]", error);
        return NextResponse.json(
            { error: "Không thể tạo phiên thanh toán" },
            { status: 500 }
        );
    }
}
