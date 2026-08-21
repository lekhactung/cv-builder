import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatDateTime } from "@/lib/utils";
import { UserActions } from "./UserActions";
import { Package, CreditCard, Activity, ClipboardList, Gift, Bot, Edit3, Wrench, RotateCcw, Clock, ArrowLeftRight, CheckCircle2, XCircle } from "lucide-react";

function formatCurrency(amount: number, currency = "VND") {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount);
}

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "admin-badge-active",
    COMPLETED: "admin-badge-active",
    TRIALING: "admin-badge-active",
    PENDING: "admin-badge-inactive",
    PAST_DUE: "admin-badge-inactive",
    CANCELLED: "admin-badge-inactive",
    EXPIRED: "admin-badge-inactive",
    FAILED: "admin-badge-inactive",
};

const CREDIT_TYPE_LABELS: Record<string, React.ReactNode> = {
    SUBSCRIPTION_GRANT: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Gift size={14} /> Subscription</div>,
    AI_GENERATION: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Bot size={14} /> AI Generate</div>,
    AI_REWRITE: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Edit3 size={14} /> AI Rewrite</div>,
    ADMIN_ADJUSTMENT: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Wrench size={14} /> Admin</div>,
    PURCHASE: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><CreditCard size={14} /> Mua</div>,
    REFUND: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><RotateCcw size={14} /> Hoàn tiền</div>,
    EXPIRATION: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Clock size={14} /> Hết hạn</div>,
    ROLLOVER: <div style={{ display: "flex", alignItems: "center", gap: 6 }}><ArrowLeftRight size={14} /> Rollover</div>,
};

export default async function AdminUserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            subscription: { include: { plan: true } },
            creditWallet: {
                include: {
                    transactions: {
                        orderBy: { createdAt: "desc" },
                        take: 15,
                    },
                },
            },
            payments: {
                orderBy: { createdAt: "desc" },
                take: 10,
                include: { plan: true },
            },
            auditLogs: {
                orderBy: { createdAt: "desc" },
                take: 10,
            },
            _count: { select: { cvs: true } },
        },
    });

    if (!user) notFound();

    const sub = user.subscription;
    const wallet = user.creditWallet;
    const initials = (user.name ?? user.email ?? "?")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="user-detail-root">
            {/* Back */}
            <Link href="/admin/users" className="user-detail-back">
                ← Quay lại danh sách
            </Link>

            {/* Header */}
            <div className="user-detail-header">
                <div className="user-detail-avatar">{initials}</div>
                <div className="user-detail-header-info">
                    <h1 className="user-detail-name">{user.name ?? "Chưa đặt tên"}</h1>
                    <p className="user-detail-email">{user.email}</p>
                    <div className="user-detail-header-badges">
                        <span className={`admin-badge ${user.role === "ADMIN" ? "admin-badge-admin" : "admin-badge-inactive"}`}>
                            {user.role}
                        </span>
                        <span className={`admin-badge ${sub?.status === "ACTIVE" ? "admin-badge-active" : "admin-badge-inactive"}`}>
                            {sub?.plan?.name ?? "Free"}
                        </span>
                        <span style={{ fontSize: 12, color: "#6b7280" }}>
                            Tham gia {formatDate(user.createdAt)}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="user-detail-stats">
                    <div className="user-detail-stat">
                        <span className="user-detail-stat-value" style={{ color: "#f59e0b" }}>
                            {wallet?.balance ?? 0}
                        </span>
                        <span className="user-detail-stat-label">Credits</span>
                    </div>
                    <div className="user-detail-stat">
                        <span className="user-detail-stat-value">{user._count.cvs}</span>
                        <span className="user-detail-stat-label">CVs</span>
                    </div>
                    <div className="user-detail-stat">
                        <span className="user-detail-stat-value">{user.payments.length}</span>
                        <span className="user-detail-stat-label">Payments</span>
                    </div>
                </div>
            </div>

            {/* Subscription */}
            <div className="user-detail-card">
                <div className="user-detail-card-header">
                    <span className="user-detail-card-icon"><Package size={18} /></span>
                    <h3 className="user-detail-card-title">Subscription</h3>
                </div>
                {sub ? (
                    <div className="user-detail-info-grid">
                        <div className="user-detail-info-item">
                            <span className="user-detail-info-label">Gói</span>
                            <span className="user-detail-info-value">{sub.plan.name}</span>
                        </div>
                        <div className="user-detail-info-item">
                            <span className="user-detail-info-label">Trạng thái</span>
                            <span className={`admin-badge ${STATUS_COLORS[sub.status] ?? "admin-badge-inactive"}`}>
                                {sub.status}
                            </span>
                        </div>
                        <div className="user-detail-info-item">
                            <span className="user-detail-info-label">Chu kỳ</span>
                            <span className="user-detail-info-value">{sub.billingInterval}</span>
                        </div>
                        <div className="user-detail-info-item">
                            <span className="user-detail-info-label">Provider</span>
                            <span className="user-detail-info-value">{sub.provider}</span>
                        </div>
                        <div className="user-detail-info-item">
                            <span className="user-detail-info-label">Bắt đầu kỳ</span>
                            <span className="user-detail-info-value">{formatDate(sub.currentPeriodStart)}</span>
                        </div>
                        <div className="user-detail-info-item">
                            <span className="user-detail-info-label">Kết thúc kỳ</span>
                            <span className="user-detail-info-value">{formatDate(sub.currentPeriodEnd)}</span>
                        </div>
                        <div className="user-detail-info-item">
                            <span className="user-detail-info-label">Huỷ cuối kỳ</span>
                            <span className="user-detail-info-value" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                {sub.cancelAtPeriodEnd ? <><CheckCircle2 size={16} color="#10b981" /> Có</> : <><XCircle size={16} color="#ef4444" /> Không</>}
                            </span>
                        </div>
                        {sub.providerSubscriptionId && (
                            <div className="user-detail-info-item" style={{ gridColumn: "1 / -1" }}>
                                <span className="user-detail-info-label">Stripe Sub ID</span>
                                <span className="user-detail-info-value" style={{ fontFamily: "monospace", fontSize: 12 }}>
                                    {sub.providerSubscriptionId}
                                </span>
                            </div>
                        )}
                    </div>
                ) : (
                    <p style={{ color: "#9ca3af", fontSize: 14 }}>Không có subscription (Free)</p>
                )}
            </div>

            {/* Actions */}
            <UserActions
                userId={user.id}
                currentRole={user.role}
                currentBalance={wallet?.balance ?? 0}
            />

            {/* Payment History */}
            <div className="user-detail-card">
                <div className="user-detail-card-header">
                    <span className="user-detail-card-icon"><CreditCard size={18} /></span>
                    <h3 className="user-detail-card-title">Lịch sử thanh toán</h3>
                </div>
                {user.payments.length === 0 ? (
                    <p style={{ color: "#9ca3af", fontSize: 14 }}>Chưa có giao dịch</p>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    {["Gói", "Số tiền", "Trạng thái", "Provider", "Ngày"].map((h) => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {user.payments.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.plan?.name ?? "—"}</td>
                                        <td style={{ fontWeight: 600 }}>
                                            {formatCurrency(p.amount, p.currency)}
                                        </td>
                                        <td>
                                            <span className={`admin-badge ${STATUS_COLORS[p.status] ?? "admin-badge-inactive"}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td style={{ color: "#9ca3af", fontSize: 12 }}>{p.provider}</td>
                                        <td style={{ color: "#9ca3af", fontSize: 12 }}>
                                            {formatDateTime(p.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Credit Transactions */}
            <div className="user-detail-card">
                <div className="user-detail-card-header">
                    <span className="user-detail-card-icon"><Activity size={18} /></span>
                    <h3 className="user-detail-card-title">Lịch sử Credits</h3>
                </div>
                {!wallet || wallet.transactions.length === 0 ? (
                    <p style={{ color: "#9ca3af", fontSize: 14 }}>Chưa có giao dịch credits</p>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    {["Loại", "Số lượng", "Trước", "Sau", "Mô tả", "Ngày"].map((h) => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {wallet.transactions.map((t) => (
                                    <tr key={t.id}>
                                        <td style={{ fontSize: 12 }}>
                                            {CREDIT_TYPE_LABELS[t.type] ?? t.type}
                                        </td>
                                        <td style={{
                                            fontWeight: 700,
                                            color: t.amount > 0 ? "#10b981" : "#ef4444",
                                        }}>
                                            {t.amount > 0 ? "+" : ""}{t.amount}
                                        </td>
                                        <td style={{ color: "#6b7280", fontSize: 12 }}>{t.balanceBefore}</td>
                                        <td style={{ color: "#6b7280", fontSize: 12 }}>{t.balanceAfter}</td>
                                        <td style={{ color: "#9ca3af", fontSize: 12 }}>{t.description ?? "—"}</td>
                                        <td style={{ color: "#9ca3af", fontSize: 12 }}>
                                            {formatDateTime(t.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Audit Logs */}
            <div className="user-detail-card">
                <div className="user-detail-card-header">
                    <span className="user-detail-card-icon"><ClipboardList size={18} /></span>
                    <h3 className="user-detail-card-title">Audit Logs</h3>
                </div>
                {user.auditLogs.length === 0 ? (
                    <p style={{ color: "#9ca3af", fontSize: 14 }}>Chưa có audit log</p>
                ) : (
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    {["Action", "Mô tả", "Thời gian"].map((h) => (
                                        <th key={h}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {user.auditLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td>
                                            <span className="admin-badge admin-badge-inactive" style={{ fontSize: 11 }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ color: "#9ca3af", fontSize: 12 }}>{log.description}</td>
                                        <td style={{ color: "#9ca3af", fontSize: 12 }}>
                                            {formatDateTime(log.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
