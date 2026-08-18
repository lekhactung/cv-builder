import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lastPayment = await prisma.payment.findFirst({
        where: { userId: session.user.id, provider: "STRIPE" },
        orderBy: { createdAt: "desc" }
    })

    if (!lastPayment?.providerSessionId) {
        return NextResponse.json(
            { error: "Không tìm thấy thông tin thanh toán" },
            { status: 400 }
        );
    }

    try {
        const checkoutSession = await stripe.checkout.sessions.retrieve(
            lastPayment.providerSessionId
        );
        const customerId = checkoutSession.customer as string

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
        });
        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error("[PORTAL_ERROR]", error);
        return NextResponse.json({ error: "Không thể mở trang quản lý" }, { status: 500 });
    }
}