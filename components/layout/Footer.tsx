import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="nav-logo">
              <div className="logo-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              Resume<span className="logo-ai">Builder</span>
            </Link>
            <p>Cố vấn nghề nghiệp cá nhân của bạn</p>
          </div>

          <div className="footer-col">
            <h4>Sản phẩm</h4>
            <a href="#">CV Builder</a>
            <a href="#">AI Analysis</a>
            <a href="#">Templates</a>
          </div>

          <div className="footer-col">
            <h4>Tài nguyên</h4>
            <a href="#">Blog</a>
            <a href="#">Career Guide</a>
            <a href="#">ATS Tips</a>
            <a href="#">FAQ</a>
          </div>

          <div className="footer-col">
            <h4>Công ty</h4>
            <a href="#">Về chúng tôi</a>
            <a href="#">Tuyển dụng</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 ResumeBuilder. All rights reserved.</p>
          <div className="footer-social">
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="GitHub">⌥</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
