"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon, ChevronDown, LayoutDashboard, Settings, LogOut, ShieldCheck } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen]       = useState(false);
  const [scrolled, setScrolled]       = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imageError, setImageError]   = useState(false);
  const { data: session, status }     = useSession();
  const { toggleTheme, isDark }       = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`navbar${scrolled ? " navbar-scrolled" : ""}`} id="navbar">
      <div className="nav-container">

        {/* Logo */}
        <Link href="/" className="nav-logo">
          <span>Resume<span className="logo-ai">Builder</span></span>
        </Link>

        {/* Nav links */}
        <ul className={`nav-links${menuOpen ? " nav-links-open" : ""}`}>
          <li><a href="#features"  className="nav-link" onClick={() => setMenuOpen(false)}>Tính năng</a></li>
          <li><a href="#templates" className="nav-link" onClick={() => setMenuOpen(false)}>Templates</a></li>
          <li><Link href="/pricing" className="nav-link" onClick={() => setMenuOpen(false)}>Bảng giá</Link></li>
          <li><a href="#"          className="nav-link" onClick={() => setMenuOpen(false)}>Blog</a></li>
        </ul>

        {/* Right actions */}
        <div className="nav-actions">

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="theme-toggle-btn" title={isDark ? "Light Mode" : "Dark Mode"}>
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb">
                {isDark ? <Moon size={16} /> : <Sun size={16} />}
              </span>
            </span>
          </button>

          {/* Auth state */}
          {status === "loading" ? (
            <div className="nav-skeleton" />
          ) : session?.user ? (
            <div className="nav-user-wrapper">
              <div className="nav-user-relative">

                {/* Trigger */}
                <div className="nav-user-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  {session.user.image && !imageError ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name ?? "Avatar"}
                      width={36}
                      height={36}
                      className="nav-user-avatar"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="nav-user-initials">
                      {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span className="nav-user-name">{session.user.name}</span>
                  <ChevronDown
                    size={16}
                    className={`nav-chevron${dropdownOpen ? " nav-chevron-open" : ""}`}
                  />
                </div>

                {/* Dropdown */}
                {dropdownOpen && (
                  <>
                    <div className="nav-dropdown-overlay" onClick={() => setDropdownOpen(false)} />

                    <div className="nav-dropdown">
                      {/* User info */}
                      <div className="nav-dropdown-header">
                        <div className="nav-dropdown-name">{session.user.name}</div>
                        <div className="nav-dropdown-email">{session.user.email}</div>
                      </div>

                      <Link href="/dashboard" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <LayoutDashboard size={15} />
                        Dashboard
                      </Link>

                      <Link href="/profile" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Settings size={15} />
                        Cài đặt tài khoản
                      </Link>

                      {session.user.role === "ADMIN" && (
                        <Link href="/admin" className="nav-dropdown-item nav-dropdown-item-admin" onClick={() => setDropdownOpen(false)}>
                          <ShieldCheck size={15} />
                          Admin Panel
                        </Link>
                      )}

                      <div className="nav-dropdown-divider" />

                      <button
                        className="nav-dropdown-item nav-dropdown-item-danger"
                        onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
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

        {/* Mobile toggle */}
        <button
          className={`nav-mobile-toggle${menuOpen ? " nav-mobile-toggle-open" : ""}`}
          id="mobile-toggle"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
