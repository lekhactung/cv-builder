import { prisma } from "@/lib/prisma"
import { AuditAction } from "@prisma/client"

interface AuditLogInput {
    action: AuditAction;
    userId?: string;
    adminId?: string;
    description: string;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
}

export const auditService = {
    async log(input: AuditLogInput) {
        try {
            await prisma.auditLog.create({
                data: {
                    action: input.action,
                    userId: input.userId,
                    adminId: input.adminId,
                    description: input.description,
                    metadata: input.metadata as any,
                    ipAddress: input.ipAddress,
                },
            });
        } catch (error) {
            console.error("[AUDIT_LOG_ERROR", error);
        }
    },

    async getLog(userId?: string, page = 1, pageSize = 20) {
        const where = userId ? { userId } : {};
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    user: { select: { name: true, email: true } },
                    admin: { select: { name: true, email: true } }
                },
            }),
            prisma.auditLog.count({ where })
        ])
        return { logs, total }
    }
}