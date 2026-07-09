import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="db-empty-state">
      <div className="db-empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </div>
      <h3 className="db-empty-title">Chưa có CV nào</h3>
      <p className="db-empty-desc">
        Tạo CV đầu tiên của bạn với sự hỗ trợ của AI. Chỉ mất vài phút!
      </p>
      <Link href="/editor/new" className="btn btn-primary btn-md">
        Tạo CV đầu tiên
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
      </Link>
    </div>
  );
}
