import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import CvCard from "@/components/dashboard/CvCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { FileText, Activity } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id;

  const cvs = await prisma.cV.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
  const stats = [
    {
      label: "Tổng CV",
      value: cvs.length,
      color: "primary" as const,
      description: "CV đã tạo",
      icon: <FileText size={20} strokeWidth={2} />,
    },
    {
      label: "ATS Score",
      value: "-",
      color: "success" as const,
      description: "Cần tạo CV để xem",
      icon: <Activity size={20} strokeWidth={2} />,
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
        <form action={async () => {
          "use server";
          const { createCvAction } = await import("@/lib/actions/cv");
          const { redirect } = await import("next/navigation");

          const newCvId = await createCvAction();
          redirect(`/editor/${newCvId}`);
        }}>
          <button type="submit" className="btn btn-primary btn-md">
            + Tạo CV mới
          </button>
        </form>
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
