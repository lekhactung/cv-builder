"use server";

import { auth } from "@/auth";
import { creditService } from "@/lib/services/credit.service";

export async function getCreditBalanceAction() {
  const session = await auth();
  if (!session?.user?.id) return 0;
  return creditService.getBalance(session.user.id);
}

export async function getCreditTransactionsAction(page = 1) {
  const session = await auth();
  if (!session?.user?.id) return { transactions: [], total: 0 };
  return creditService.getTransactions(session.user.id, page);
}