import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { subscriptionService } from "@/lib/services/subscription.service";
import { creditService } from "@/lib/services/credit.service";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import BillingPageClient from "@/components/billing/BillingPageClient";

export const metadata = { title: "Billing | ResumeBuilder" };

export default async function BillingPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth");

    const userId = session.user.id;

    const [subscription, balance, transactions, payments] = await Promise.all([
        subscriptionService.getSubscription(userId),
        creditService.getBalance(userId),
        prisma.creditTransaction.findMany({
            where: { wallet: { userId } },
            orderBy: { createdAt: "desc" },
            take: 10,
        }),
        prisma.payment.findMany({
            where: { userId },
            include: { plan: true },
            orderBy: { createdAt: "desc" },
            take: 10,
        }),
    ]);

    return (
        <BillingPageClient
            subscription={subscription}
            balance={balance}
            transactions={transactions}
            payments={payments}
        />
    );
}