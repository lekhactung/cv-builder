import { prisma } from "@/lib/prisma";
import { CreditTransactionType } from "@prisma/client";

export const creditService = {
    async getBalance(userId: string): Promise<number> {
        const wallet = await prisma.creditWallet.findUnique({
            where: { userId },
        })
        return wallet?.balance ?? 0;
    },

    async hasEnoughCredit(userId: string, amount: number): Promise<boolean> {
        const balance = await this.getBalance(userId);
        return balance >= amount;
    },

    async consumeCredits(userId: string, amount: number, type: CreditTransactionType, description: string, referenceId?: string) {
        return prisma.$transaction(async (tx) => {
            const wallet = await tx.creditWallet.findUnique({ where: { userId } });

            if (!wallet || wallet.balance < amount) {
                throw new Error("INSUFFICIENT_CREDITS")
            }

            const newBalance = wallet.balance - amount;

            await tx.creditWallet.update({
                where: { id: wallet.id },
                data: { balance: newBalance },
            })

            return tx.creditTransaction.create({
                data: {
                    walletId: wallet.id,
                    type,
                    amount: -amount,
                    balanceBefore: wallet.balance,
                    balanceAfter: newBalance,
                    description,
                    referenceId,
                },
            })
        })
    },

    async addCredit(userId: string, amount: number, type: CreditTransactionType, description: string, referenceId?: string) {
        return prisma.$transaction(async (tx) => {
            const wallet = await tx.creditWallet.upsert({
                where: { userId },
                create: { userId, balance: amount },
                update: { balance: { increment: amount } }
            })
            const balanceBefore = wallet.balance - amount;
            const balanceAfter = wallet.balance;

            return tx.creditTransaction.create({
                data: {
                    walletId: wallet.id,
                    type,
                    amount,
                    balanceBefore,
                    balanceAfter,
                    description,
                    referenceId,
                },
            });
        });
    },

    async refundCredit(userId: string, amount: number, description: string, referenceId: string) {
        return this.addCredit(userId, amount, "REFUND", description, referenceId);
    },

    async adminAdjust(userId: string, amount: number, description: string, adminId: string) {
        if (amount > 0) {
            return this.addCredit(userId, amount, "ADMIN_ADJUSTMENT", description, adminId);
        } else {
            return this.consumeCredits(userId, Math.abs(amount), "ADMIN_ADJUSTMENT", description, adminId)
        }
    },

    async getTransactions(userId: string, page = 1, pageSize = 20) {
        const wallet = await prisma.creditWallet.findUnique({ where: { userId } });

        if (!wallet) return { transactions: [], total: 0 };

        const [transactions, total] = await Promise.all([
            prisma.creditTransaction.findMany({
                where: { walletId: wallet.id },
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.creditTransaction.count({ where: { walletId: wallet.id } }),
        ]);
        return { transactions, total };
    }

}