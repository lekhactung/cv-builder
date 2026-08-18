"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getPaymentHistoryAction(page = 1) {
  const session = await auth();
  if (!session?.user?.id) return { payments: [], total: 0 };

  const pageSize = 10;
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId: session.user.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where: { userId: session.user.id } }),
  ]);

  return { payments, total };
}