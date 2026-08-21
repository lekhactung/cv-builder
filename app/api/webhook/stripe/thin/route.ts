import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
        return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    try {
        stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET_THIN!
        );
    } catch (err) {
        console.error("[THIN_WEBHOOK_SIGNATURE_ERROR]", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    return NextResponse.json({ received: true });
}
