import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Admin Dashboard | ResumeBuilder" };

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    activeSubscriptions,
    proUsers,
    premiumUsers,
    revenue,
    failedPayments,
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
    </div>
  );
}