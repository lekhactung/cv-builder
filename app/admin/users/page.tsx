import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface SearchParams {
  q?: string;
  page?: string;
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, page: pageParam } = await searchParams;
  const search   = q ?? "";
  const page     = parseInt(pageParam ?? "1");
  const pageSize = 20;

  const where = search
    ? {
        OR: [
          { name:  { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        subscription: { include: { plan: true } },
        creditWallet: true,
        _count: { select: { cvs: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <div>
      <h1 className="admin-page-title">Users</h1>

      {/* Search */}
      <form className="admin-search-form">
        <input
          name="q"
          defaultValue={search}
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="admin-search-input"
        />
        <button type="submit" className="admin-search-btn">
          Tìm
        </button>
      </form>

      {/* Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              {["User", "Plan", "Credits", "CVs", "Trạng thái", "Hành động"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{u.name ?? "—"}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{u.email}</div>
                </td>
                <td>
                  <span className={`admin-badge ${u.subscription?.status === "ACTIVE" ? "admin-badge-active" : "admin-badge-inactive"}`}>
                    {u.subscription?.plan?.name ?? "Free"}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: "#f59e0b" }}>
                  {u.creditWallet?.balance ?? 0}
                </td>
                <td style={{ color: "#6b7280" }}>
                  {u._count.cvs}
                </td>
                <td>
                  <span className={`admin-badge ${u.role === "ADMIN" ? "admin-badge-admin" : "admin-badge-inactive"}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  <Link
                    href={`/admin/users/${u.id}`}
                    style={{ color: "#7c3aed", textDecoration: "none", fontSize: 13, fontWeight: 500 }}
                  >
                    Chi tiết →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="admin-pagination">
        <span className="admin-pagination-info">
          {total} users tổng · Trang {page}/{Math.ceil(total / pageSize)}
        </span>
        <div className="admin-pagination-actions">
          {page > 1 && (
            <Link href={`?q=${search}&page=${page - 1}`} className="admin-pagination-btn">← Trước</Link>
          )}
          {page * pageSize < total && (
            <Link href={`?q=${search}&page=${page + 1}`} className="admin-pagination-btn">Sau →</Link>
          )}
        </div>
      </div>
    </div>
  );
}