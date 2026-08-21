import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { subscriptionService } from "@/lib/services/subscription.service";
import { creditService } from "@/lib/services/credit.service";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [subscription, balance] = await Promise.all([
        subscriptionService.getSubscription(session.user.id),
        creditService.getBalance(session.user.id),
    ]);

    return NextResponse.json({ subscription, balance });
}