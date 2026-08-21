import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Search } from "lucide-react";

interface SearchParams {
  q?: string;
  page?: string;
  status?: string;
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, page: pageParam, status } = await searchParams;
  const search   = q ?? "";
  const page     = parseInt(pageParam ?? "1");
  const pageSize = 20;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { providerSessionId: { contains: search, mode: "insensitive" } },
      { providerPaymentId: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status && status !== "ALL") {
    where.status = status;
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        user: true,
        plan: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.payment.count({ where }),
  ]);

  return (
    <div>
      <h1 className="admin-page-title">Payments</h1>

      {/* Filters */}
      <form className="admin-search-form" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <input
            name="q"
            defaultValue={search}
            placeholder="Tìm theo email, tên, mã GD..."
            className="admin-search-input"
            style={{ paddingLeft: "36px" }}
          />
          <Search size={16} style={{ position: "absolute", left: "12px", top: "12px", color: "#9ca3af" }} />
        </div>
        
        <select name="status" defaultValue={status ?? "ALL"} className="admin-search-input" style={{ width: "auto" }}>
          <option value="ALL">Tất cả trạng thái</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="PENDING">PENDING</option>
          <option value="FAILED">FAILED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>

        <button type="submit" className="admin-search-btn">
          Lọc
        </button>
      </form>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {["Giao dịch", "Khách hàng", "Gói", "Số tiền", "Trạng thái", "Thời gian"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#6b7280" }}>
                  Không tìm thấy giao dịch nào.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.id}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{p.provider}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.user?.name ?? "—"}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af" }}>{p.user?.email}</div>
                  </td>
                  <td>
                    {p.plan?.name ?? "—"}
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
                  <td style={{ color: "#6b7280", fontSize: 13 }}>
                    {formatDateTime(p.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="admin-pagination">
          <span className="admin-pagination-info">
            {total} giao dịch · Trang {page}/{Math.ceil(total / pageSize)}
          </span>
          <div className="admin-pagination-actions">
            {page > 1 && (
              <Link href={`?q=${search}&status=${status ?? "ALL"}&page=${page - 1}`} className="admin-pagination-btn">← Trước</Link>
            )}
            {page * pageSize < total && (
              <Link href={`?q=${search}&status=${status ?? "ALL"}&page=${page + 1}`} className="admin-pagination-btn">Sau →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
