import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

export const metadata = { title: "Admin Dashboard | ResumeBuilder" };

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    activeSubscriptions,
    proUsers,
    premiumUsers,
    revenue,
    failedPayments,
    recentPayments,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({
      where: { status: "ACTIVE", plan: { slug: "PRO" } }
    }),
    prisma.subscription.count({
      where: { status: "ACTIVE", plan: { slug: "PREMIUM" } }
    }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.payment.count({
      where: { status: "FAILED" },
    }),
    prisma.payment.findMany({
      include: { user: true, plan: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const metrics = [
    { label: "Tổng users",          value: totalUsers,         color: "#7c3aed" },
    { label: "Subscription Active", value: activeSubscriptions, color: "#22c55e" },
    { label: "Pro users",            value: proUsers,            color: "#3b82f6" },
    { label: "Premium users",        value: premiumUsers,        color: "#f59e0b" },
    { label: "Tổng doanh thu",       value: `${new Intl.NumberFormat("vi-VN").format(revenue._sum.amount ?? 0)}₫`, color: "#10b981" },
    { label: "Payment thất bại",     value: failedPayments,      color: "#ef4444" },
  ];

  return (
    <div>
      <h1 className="admin-page-title">Admin Dashboard</h1>

      <div className="admin-metric-grid">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="admin-metric-card"
            style={{ borderLeft: `4px solid ${m.color}` }}
          >
            <div className="admin-metric-label">{m.label}</div>
            <div className="admin-metric-value" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32 }}>
        {/* Recent Payments */}
        <div className="admin-table-container" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>Giao dịch gần đây</h2>
            <Link href="/admin/payments" style={{ fontSize: 13, color: "#7c3aed", textDecoration: "none", fontWeight: 500 }}>
              Xem tất cả →
            </Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "16px", color: "#6b7280" }}>Chưa có giao dịch.</td>
                </tr>
              ) : recentPayments.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.user?.name ?? "—"}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{formatDateTime(p.createdAt)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: "#1e293b" }}>
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: p.currency }).format(p.amount)}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-badge ${p.status === "COMPLETED" ? "admin-badge-active" : p.status === "PENDING" ? "admin-badge-inactive" : "admin-badge-admin"}`} style={{ 
                      background: p.status === "FAILED" || p.status === "CANCELLED" ? "rgba(220, 38, 38, 0.1)" : undefined,
                      color: p.status === "FAILED" || p.status === "CANCELLED" ? "#dc2626" : undefined
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Users */}
        <div className="admin-table-container" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>Người dùng mới</h2>
            <Link href="/admin/users" style={{ fontSize: 13, color: "#7c3aed", textDecoration: "none", fontWeight: 500 }}>
              Xem tất cả →
            </Link>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Đăng ký lúc</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: "16px", color: "#6b7280" }}>Chưa có người dùng.</td>
                </tr>
              ) : recentUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{u.name ?? "—"}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{u.email}</div>
                  </td>
                  <td style={{ color: "#6b7280", fontSize: 13 }}>
                    {formatDateTime(u.createdAt)}
                  </td>
                  <td>
                    <span className={`admin-badge ${u.role === "ADMIN" ? "admin-badge-admin" : "admin-badge-inactive"}`}>
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}