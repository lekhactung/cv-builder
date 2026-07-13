"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";

import { Sun, Moon, ChevronDown, LayoutDashboard, Settings, LogOut } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dropdownBg     = isDark ? "#1A1A2E" : "#FFFFFF";
  const dropdownBorder = isDark ? "#2E2E50"  : "rgba(124,58,237,0.12)";
  const dropdownShadow = isDark
    ? "0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.1)"
    : "0 10px 40px rgba(100,80,180,0.15), 0 0 0 1px rgba(124,58,237,0.08)";
  const itemColor      = isDark ? "#E2E8F0" : "#1E1B4B";
  const itemHoverBg    = isDark ? "#252540"  : "#F1F0FA";
  const dividerColor   = isDark ? "#2E2E50"  : "#E8E6F8";

  return (
    <nav className={`navbar${scrolled ? " navbar-scrolled" : ""}`} id="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <span>Resume<span className="logo-ai">Builder</span></span>
        </Link>

        <ul className={`nav-links${menuOpen ? " nav-links-open" : ""}`}>
          <li><a href="#features" className="nav-link" onClick={() => setMenuOpen(false)}>Tính năng</a></li>
          <li><a href="#templates" className="nav-link" onClick={() => setMenuOpen(false)}>Templates</a></li>
          <li><a href="#" className="nav-link" onClick={() => setMenuOpen(false)}>Blog</a></li>
        </ul>

        <div className="nav-actions">

          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={isDark ? "Light Mode" : "Dark Mode"}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb">
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </span>
            </span>
          </button>

          {status === "loading" ? (
            <div style={{ width: 80, height: 36 }} />
          ) : session?.user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

              <div style={{ position: "relative" }}>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "Avatar"}
                      width={34}
                      height={34}
                      style={{ borderRadius: "50%", border: "2px solid var(--primary-light)", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "var(--gradient-primary)", color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 600
                    }}>
                      {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                  )}

                  <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                    {session.user.name}
                  </span>

                  <ChevronDown
                    size={16}
                    style={{
                      transform: dropdownOpen ? "rotate(180deg)" : "none",
                      transition: "transform 0.2s ease",
                      color: "var(--text-muted)",
                      marginLeft: "4px"
                    }}
                  />
                </div>

                {/* Menu Dropdown */}
                {dropdownOpen && (
                  <>
                    {/* Lớp phủ trong suốt */}
                    <div
                      onClick={() => setDropdownOpen(false)}
                      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}
                    />

                    {/* Hộp Menu */}
                    <div style={{
                      position: "absolute", right: 0, top: "calc(100% + 12px)",
                      background: dropdownBg,
                      border: `1px solid ${dropdownBorder}`,
                      borderRadius: "12px",
                      boxShadow: dropdownShadow,
                      padding: "6px 0", minWidth: "200px",
                      zIndex: 1000, display: "flex", flexDirection: "column",
                      backdropFilter: "blur(16px)",
                    }}>

                      {/* Thông tin user */}
                      <div style={{
                        padding: "12px 16px 10px",
                        borderBottom: `1px solid ${dividerColor}`,
                        marginBottom: "4px"
                      }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: itemColor }}>
                          {session.user.name}
                        </div>
                        <div style={{ fontSize: "11px", color: isDark ? "#6B6B8A" : "#9896B8", marginTop: "2px" }}>
                          {session.user.email}
                        </div>
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        style={{ padding: "10px 16px", color: itemColor, textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = itemHoverBg}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                      >
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>

                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        style={{ padding: "10px 16px", color: itemColor, textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = itemHoverBg}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                      >
                        <Settings size={15} />
                        Cài đặt tài khoản
                      </Link>
                      {/* Đường phân cách */}
                      <div style={{ height: "1px", background: dividerColor, margin: "4px 0" }} />

                      <button
                        onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
                        style={{
                          padding: "10px 16px", color: "#DC2626",
                          background: "none", border: "none", textAlign: "left",
                          cursor: "pointer", fontSize: "14px", width: "100%",
                          fontFamily: "inherit", display: "flex", alignItems: "center", gap: "10px"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(220,38,38,0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                      >
                        <LogOut size={15} />
                        Đăng xuất
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
