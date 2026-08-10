"use client"
import Link from "next/link";
import { useTransition, useState } from "react";
import { deleteCvAction } from "@/lib/actions/cv";
import { Trash2, Download } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { usePdfExport } from "@/lib/pdf/usePdfExport";

interface CvCardProps {
  id: string;
  title: string;
  updatedAt: Date;
  template?: string;
}
export default function CvCard({ id, title, updatedAt, template = "Modern" }: CvCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isFetchingData, setIsFetchingData] = useState(false);
  const { exportPdf, isExporting } = usePdfExport();

  const handleDownload = async () => {
    setIsFetchingData(true);
    try {
      const res = await fetch(`/api/cvs/${id}`);
      if (!res.ok) throw new Error("Không thể tải dữ liệu CV");
      const { cv } = await res.json();

      const cvData = typeof cv.data === "string" ? JSON.parse(cv.data) : cv.data;
      await exportPdf(cvData, cv.template || template, title);
    } catch (error) {
      console.error(error);
      alert("Lỗi khi tải xuống CV. Vui lòng thử lại sau.");
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(`Bạn có chắc muốn xóa CV "${title}" không? Hành động này không thể hoàn tác.`);

    if (confirmDelete) {
      startTransition(async () => {
        await deleteCvAction(id);
      })
    }
  }

  const formattedDate = formatDateTime(updatedAt)

  return (
    <div className="db-cv-card">
      {/* Preview thumbnail */}
      <div className="db-cv-thumbnail">
        <div className="db-cv-thumbnail-inner">
          <div className="db-cv-mock-line" style={{ width: "60%" }} />
          <div className="db-cv-mock-line" style={{ width: "40%" }} />
          <div className="db-cv-mock-line" style={{ width: "80%", marginTop: "0.5rem" }} />
          <div className="db-cv-mock-line" style={{ width: "70%" }} />
          <div className="db-cv-mock-line" style={{ width: "50%" }} />
        </div>
      </div>
      {/* Info */}
      <div className="db-cv-info">
        <h3 className="db-cv-title">{title}</h3>
        <p className="db-cv-meta">
          <span className="badge badge-primary">{template}</span>
          <span className="db-cv-date" suppressHydrationWarning>Cập nhật {formattedDate}</span>
        </p>
      </div>
      {/* Actions */}
      <div className="db-cv-actions">
        <Link href={`/editor/${id}`} className="btn btn-primary btn-sm">
          Chỉnh sửa
        </Link>
        <button
          className="btn btn-ghost btn-sm text-gray-500 hover:text-primary hover:bg-indigo-50"
          onClick={handleDownload}
          disabled={isFetchingData || isExporting}
          title="Tải xuống PDF"
        >
          {isFetchingData || isExporting ? "Đang tải..." : <Download size={16} />}
        </button>
        <button className="btn btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleDelete}
          disabled={isPending}
          title="Xóa CV"
        >
          {isPending ? (
            "Đang xóa..."
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </div>
  );
}