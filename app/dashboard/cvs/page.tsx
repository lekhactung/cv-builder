import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CvCard from "@/components/dashboard/CvCard";
import EmptyState from "@/components/dashboard/EmptyState";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata = {
    title: "Tất cả CV của tôi | ResumeBuilder"
}


export default async function CvsPage() {
    const session = await auth();
    const userId = session!.user!.id;

    const cvs = await prisma.cV.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
    });

    return (
        <div className="db-page">
            {/* Tiêu đề trang */}
            <div className="db-page-header">
                <div>
                    <h1 className="db-page-title flex items-center gap-2">
                        <FileText className="text-primary" />
                        Tất cả CV của tôi
                    </h1>
                    <p className="db-page-subtitle">
                        Bạn đang có tổng cộng {cvs.length} bản CV trong hệ thống.
                    </p>
                </div>

                {/* Nút tạo CV gọi Server Action */}
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
            {/* Danh sách CV (Tái sử dụng code cũ) */}
            <section className="db-section mt-8">
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
    )
}