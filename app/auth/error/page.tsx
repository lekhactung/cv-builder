"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  OAuthSignin: "Không thể khởi tạo đăng nhập Google. Vui lòng thử lại.",
  OAuthCallback: "Đăng nhập Google thất bại. Vui lòng thử lại.",
  OAuthCreateAccount: "Không thể tạo tài khoản từ Google. Email có thể đã được dùng với phương thức khác.",
  EmailCreateAccount: "Không thể tạo tài khoản với email này.",
  Callback: "Có lỗi xảy ra trong quá trình xác thực. Vui lòng thử lại.",
  OAuthAccountNotLinked: "Email này đã được đăng ký bằng phương thức khác. Vui lòng đăng nhập bằng email & mật khẩu.",
  EmailSignin: "Không thể gửi email đăng nhập.",
  CredentialsSignin: "Email hoặc mật khẩu không đúng.",
  SessionRequired: "Vui lòng đăng nhập để truy cập trang này.",
  Default: "Có lỗi xảy ra. Vui lòng thử lại.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") ?? "Default";
  const message = errorMessages[errorCode] ?? errorMessages["Default"];

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-grid" />
        <div className="auth-orb-1" />
        <div className="auth-orb-2" />
      </div>

      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="auth-logo">
          <Link href="/" className="nav-logo">
            <div className="logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            Resume<span className="logo-ai">AI</span>
          </Link>
        </div>

        <div style={{ margin: "2rem 0" }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(239,68,68,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h1 className="auth-title" style={{ fontSize: "1.4rem" }}>
            Đăng nhập thất bại
          </h1>
          <p className="auth-subtitle" style={{ color: "#ef4444", marginTop: "0.5rem" }}>
            {message}
          </p>
        </div>

        <Link
          href="/auth"
          className="btn-primary auth-submit"
          style={{ display: "block", textDecoration: "none", textAlign: "center" }}
          id="back-to-login-btn"
        >
          ← Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
