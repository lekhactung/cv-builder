import Link from "next/link";
interface CvCardProps {
  id: string;
  title: string;
  updatedAt: Date;
  template?: string;
}
export default function CvCard({ id, title, updatedAt, template = "Modern" }: CvCardProps) {
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(updatedAt);
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
          <span className="db-cv-date">Cập nhật {formattedDate}</span>
        </p>
      </div>
      {/* Actions */}
      <div className="db-cv-actions">
        <Link href={`/editor/${id}`} className="btn btn-primary btn-sm">
          Chỉnh sửa
        </Link>
        <button className="btn btn-ghost btn-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}