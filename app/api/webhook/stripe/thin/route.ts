import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET_THIN?.trim();
  if (!signingSecret) {
    console.error("[THIN_WEBHOOK_CONFIG_ERROR] Missing STRIPE_WEBHOOK_SECRET_THIN");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  try {
    stripe.webhooks.constructEvent(rawBody, signature, signingSecret);
  } catch (err) {
    console.error(
      "[THIN_WEBHOOK_SIGNATURE_ERROR]",
      err instanceof Error ? err.message : "Signature verification failed",
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
