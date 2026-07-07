"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? " navbar-scrolled" : ""}`} id="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          {/* <div className="logo-icon"> 
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div> */}
          <span>Resume<span className="logo-ai">Builder</span></span>
        </Link>

        <ul className={`nav-links${menuOpen ? " nav-links-open" : ""}`}>
          <li><a href="#features" className="nav-link" onClick={() => setMenuOpen(false)}>Tính năng</a></li>
          <li><a href="#templates" className="nav-link" onClick={() => setMenuOpen(false)}>Templates</a></li>
          <li><a href="#" className="nav-link" onClick={() => setMenuOpen(false)}>Blog</a></li>
        </ul>

        <div className="nav-actions">
          {status === "loading" ? (
            <div style={{ width: 80, height: 36 }} />
          ) : session?.user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

              {/* Nút Dashboard nhanh */}
              <Link href="/dashboard" className="btn-nav-ghost">Dashboard</Link>

              {/* Khu vực Avatar và Dropdown */}
              <div style={{ position: "relative" }}>

                {/* Nút click mở/đóng Dropdown */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "Avatar"}
                      width={36}
                      height={36}
                      style={{ borderRadius: "50%", border: "2px solid var(--accent-primary)", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "var(--accent-primary)", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 600
                    }}>
                      {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                  )}

                  <span style={{ fontSize: 14, fontWeight: 500 }}>{session.user.name}</span>

                  {/* Mũi tên xoay theo trạng thái dropdown */}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    style={{
                      transform: dropdownOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease"
                    }}
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {/* Menu Dropdown — chỉ hiện khi dropdownOpen = true */}
                {dropdownOpen && (
                  <>
                    {/* Lớp phủ trong suốt: click ra ngoài sẽ đóng dropdown */}
                    <div
                      onClick={() => setDropdownOpen(false)}
                      style={{
                        position: "fixed", top: 0, left: 0,
                        right: 0, bottom: 0, zIndex: 999
                      }}
                    />

                    {/* Hộp Menu */}
                    <div style={{
                      position: "absolute", right: 0, top: "calc(100% + 12px)",
                      background: "#1e1e24", border: "1px solid #2e2e38",
                      borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                      padding: "6px 0", minWidth: "180px",
                      zIndex: 1000, display: "flex", flexDirection: "column"
                    }}>

                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        style={{ padding: "10px 16px", color: "#e2e8f0", textDecoration: "none", fontSize: "14px" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#2e2e38"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                      >
                        📊 Dashboard
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{ padding: "10px 16px", color: "#e2e8f0", textDecoration: "none", fontSize: "14px" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#2e2e38"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                      >
                        ⚙️ Cài đặt tài khoản
                      </Link>

                      {/* Đường phân cách */}
                      <div style={{ height: "1px", background: "#2e2e38", margin: "6px 0" }} />

                      <button
                        onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
                        style={{
                          padding: "10px 16px", color: "#ef4444",
                          background: "none", border: "none", textAlign: "left",
                          cursor: "pointer", fontSize: "14px", width: "100%", font: "inherit"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#2e2e38"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                      >
                        🚪 Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

          ) : (
            <>
              <Link href="/auth" className="btn-nav-ghost" id="nav-login">Đăng nhập</Link>
              <Link href="/auth" className="btn-nav-primary" id="nav-signup">Bắt đầu miễn phí</Link>
            </>
          )}
        </div>

        <button
          className={`nav-mobile-toggle${menuOpen ? " nav-mobile-toggle-open" : ""}`}
          id="mobile-toggle"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}
