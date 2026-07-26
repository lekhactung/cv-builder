import Link from "next/link";
export default function HeroSection() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg-grid"></div>
      <div className="hero-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>AI-Powered · ATS Optimized · 10,000+ CVs tạo thành công</span>
          </div>
          <h1 className="hero-title">
            Xây dựng CV <span className="gradient-text">nổi bật</span><br />
            với sức mạnh của <span className="gradient-text-cyan">AI</span>
          </h1>
          <p className="hero-subtitle">
            Không chỉ là công cụ tạo CV — ResumeAI là{" "}
            <strong>cố vấn nghề nghiệp AI cá nhân</strong>{" "}
            giúp bạn vượt qua ATS và ấn tượng nhà tuyển dụng ngay từ cái nhìn đầu tiên.
          </p>
          <div className="hero-cta">
            <Link href="/editor/new?template=Modern" className="btn btn-primary btn-lg" id="hero-cta-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg> Tạo CV mới
            </Link>
            <a href="#demo" className="btn btn-outline btn-lg" id="hero-cta-demo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="currentColor" />
              </svg>
              Xem demo
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">10K+</span>
              <span className="stat-label">CVs đã tạo</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">+35%</span>
              <span className="stat-label">Tỷ lệ phỏng vấn</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">4.9★</span>
              <span className="stat-label">Đánh giá</span>
            </div>
          </div>
        </div>

        {/* Animated CV Mockup */}
        <div className="hero-visual">
          <div className="cv-mockup-container">
            <div className="cv-mockup">
              <div className="mockup-header">
                <div className="mockup-avatar"></div>
                <div className="mockup-name-block">
                  <div className="mockup-name"></div>
                  <div className="mockup-title"></div>
                </div>
              </div>
              <div className="mockup-section">
                <div className="mockup-section-title"></div>
                <div className="mockup-line w-full"></div>
                <div className="mockup-line w-4/5"></div>
                <div className="mockup-line w-3/5"></div>
              </div>
              <div className="mockup-section">
                <div className="mockup-section-title"></div>
                <div className="mockup-exp-item">
                  <div className="mockup-line w-3/4"></div>
                  <div className="mockup-line w-full"></div>
                  <div className="mockup-line w-4/5"></div>
                </div>
              </div>
              <div className="mockup-skills">
                <div className="mockup-skill-tag"></div>
                <div className="mockup-skill-tag"></div>
                <div className="mockup-skill-tag"></div>
                <div className="mockup-skill-tag"></div>
              </div>
            </div>

            {/* AI Scan overlay */}
            <div className="ai-scan-overlay">
              <div className="scan-line"></div>
            </div>

            {/* AI Score Badge */}
            <div className="ai-score-badge">
              <div className="score-ring">
                <svg viewBox="0 0 80 80" className="score-svg">
                  <circle cx="40" cy="40" r="32" className="score-track" />
                  <circle cx="40" cy="40" r="32" className="score-fill" id="hero-score-circle" />
                </svg>
                <span className="score-num">87</span>
              </div>
              <div className="score-info">
                <span className="score-label">ATS Score</span>
                <span className="score-status">Excellent</span>
              </div>
            </div>

            {/* AI Suggestion Card */}
            <div className="ai-suggestion-float">
              <div className="suggestion-icon">✨</div>
              <div className="suggestion-text">
                <strong>AI Gợi ý:</strong> Thêm số liệu vào thành tựu của bạn
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
