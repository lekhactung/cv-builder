import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { webhookService } from "@/lib/services/webhook.service";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!signingSecret) {
    console.error("[WEBHOOK_CONFIG_ERROR] Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, signingSecret);
  } catch (err) {
    console.error(
      "[WEBHOOK_SIGNATURE_ERROR]",
      err instanceof Error ? err.message : "Signature verification failed",
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    await webhookService.processStripeEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[WEBHOOK_HANDLER_ERROR]", error);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
