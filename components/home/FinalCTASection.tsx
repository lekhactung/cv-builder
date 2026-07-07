import Link from "next/link";

export default function FinalCTASection() {
  return (
    <section className="final-cta-section">
      <div className="container">
        <div className="final-cta-card">
          <div className="final-cta-orb"></div>
          <h2>
            Sẵn sàng tạo CV <span className="gradient-text">ấn tượng</span>?
          </h2>
          <p>Tham gia cùng 10,000+ ứng viên đã nâng tầm CV của mình với ResumeAI</p>
          <Link href="/editor" className="btn btn-primary btn-lg" id="final-cta-btn">
            Tạo CV ngay — Miễn phí
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
          <p className="final-cta-note">Không cần thẻ tín dụng · Cancel bất cứ lúc nào</p>
        </div>
      </div>
    </section>
  );
}
