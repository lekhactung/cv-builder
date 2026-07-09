import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import CvCard from "@/components/dashboard/CvCard";
import EmptyState from "@/components/dashboard/EmptyState";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const cvs: any[] = []; 

  const stats = [
    {
      label: "Tổng CV",
      value: cvs.length,
      color: "primary" as const,
      description: "CV đã tạo",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      label: "ATS Score",
      value: "-",
      color: "success" as const,
      description: "Cần tạo CV để xem",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
  ];

  return (
    <div className="db-page">
      {/* Page header */}
      <div className="db-page-header">
        <div>
          <h1 className="db-page-title">
            Chào mừng, {session?.user?.name?.split(" ").pop() ?? "bạn"} 👋
          </h1>
          <p className="db-page-subtitle">
            Quản lý và tạo CV chuyên nghiệp của bạn
          </p>
        </div>
        <Link href="/editor/new" className="btn btn-primary btn-md">
          + Tạo CV mới
        </Link>
      </div>

      {/* Stats */}
      <div className="db-stats-grid">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* CV List */}
      <section className="db-section">
        <h2 className="db-section-title">CV của tôi</h2>
        {cvs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="db-cv-grid">
            {cvs.map((cv) => (
              <CvCard
                key={cv.id}
                id={cv.id}
                title={cv.title}
                updatedAt={cv.updatedAt}
                template={cv.template}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
