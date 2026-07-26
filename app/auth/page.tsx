"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Email hoặc mật khẩu không đúng");
    } else {
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const firstName = form.get("firstname") as string;
    const lastName = form.get("lastname") as string;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`.trim(),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });
      router.push("/");
      router.refresh();
    }
    setLoading(false);
  }

  const Logo = () => (
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
  );

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  const LinkedInIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-grid" />
        <div className="auth-orb-1" />
        <div className="auth-orb-2" />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <Logo />
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab${tab === "login" ? " active" : ""}`}
            onClick={() => { setTab("login"); setError(""); }}
            id="tab-login"
          >
            Đăng nhập
          </button>
          <button
            className={`auth-tab${tab === "register" ? " active" : ""}`}
            onClick={() => { setTab("register"); setError(""); }}
            id="tab-register"
          >
            Đăng ký
          </button>
        </div>

        {tab === "login" && (
          <div id="form-login">
            <h1 className="auth-title">Chào mừng trở lại!</h1>
            <p className="auth-subtitle">Tiếp tục xây dựng CV chuyên nghiệp của bạn</p>

            <div className="oauth-grid">
              <button className="oauth-btn"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                id="google-login-btn"
                type="button">
                <GoogleIcon /> Google
              </button>
              <button className="oauth-btn" id="linkedin-login-btn" type="button">
                <LinkedInIcon /> LinkedIn
              </button>
            </div>

            <div className="divider"><span>hoặc đăng nhập bằng email</span></div>

            <form id="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email</label>
                <input type="email" id="login-email" name="email" className="form-input" placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Mật khẩu</label>
                <input type="password" id="login-password" name="password" className="form-input" placeholder="••••••••" required />
              </div>
              <div className="form-footer">
                <label className="form-check">
                  <input type="checkbox" id="remember-me" />
                  Ghi nhớ đăng nhập
                </label>
                <a href="#" className="form-link">Quên mật khẩu?</a>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn-primary auth-submit" id="login-submit-btn" disabled={loading}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập →"}
              </button>
            </form>

            <p className="auth-switch">
              Chưa có tài khoản?{" "}
              <button type="button" className="form-link" onClick={() => setTab("register")} id="switch-to-register">
                Đăng ký miễn phí
              </button>
            </p>
          </div>
        )}

        {tab === "register" && (
          <div id="form-register">
            <h1 className="auth-title">Tạo tài khoản</h1>
            <p className="auth-subtitle">Miễn phí · Không cần thẻ tín dụng</p>

            <div className="oauth-grid">
              <button className="oauth-btn" 
              id="google-register-btn" 
              type="button"
              onClick={()=>signIn("google", {callbackUrl : "/"})}>
                <GoogleIcon /> Google
              </button>
              <button className="oauth-btn" id="linkedin-register-btn" type="button">
                <LinkedInIcon /> LinkedIn
              </button>
            </div>

            <div className="divider"><span>hoặc đăng ký bằng email</span></div>

            <form id="register-form" onSubmit={handleRegister}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-firstname">Họ</label>
                  <input type="text" id="reg-firstname" name="firstname" className="form-input" placeholder="Nguyễn" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-lastname">Tên</label>
                  <input type="text" id="reg-lastname" name="lastname" className="form-input" placeholder="Văn A" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <input type="email" id="reg-email" name="email" className="form-input" placeholder="you@example.com" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Mật khẩu</label>
                <input type="password" id="reg-password" name="password" className="form-input" placeholder="Tối thiểu 6 ký tự" required minLength={6} />
              </div>
              <div className="form-footer">
                <label className="form-check">
                  <input type="checkbox" id="agree-terms" required />
                  Tôi đồng ý với{" "}
                  <a href="#" className="form-link">Điều khoản dịch vụ</a>
                </label>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button type="submit" className="btn-primary auth-submit" id="register-submit-btn" disabled={loading}>
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản miễn phí →"}
              </button>
            </form>

            <p className="auth-switch">
              Đã có tài khoản?{" "}
              <button type="button" className="form-link" onClick={() => setTab("login")} id="switch-to-login">
                Đăng nhập
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
