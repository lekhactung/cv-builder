"use client";

import { useState, useCallback, useRef } from "react";
import { Search, Coins, Plus, Minus, CheckCircle, XCircle, User, Loader2 } from "lucide-react";

interface UserResult {
  id: string;
  name: string | null;
  email: string | null;
  creditWallet: { balance: number } | null;
  subscription: { plan: { name: string } } | null;
}

type MsgType = { type: "success" | "error"; text: string };

export default function AdminCreditsPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<UserResult[]>([]);
  const [selected, setSelected] = useState<UserResult | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);  
  const [message, setMessage] = useState<MsgType | null>(null);

  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&page=1`);
      const data = await res.json();
      setResults(data.users ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      searchUsers(val);
    }, 300);
  };

  const selectUser = (user: UserResult) => {
    setSelected(user);
    setResults([]);
    setQuery(`${user.name ?? ""} — ${user.email}`);
    setMessage(null);
    setAmount("");
    setDescription("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setMessage(null);
    const parsed = parseInt(amount);
    if (isNaN(parsed) || parsed === 0) {
      setMessage({ type: "error", text: "Số credits không hợp lệ" });
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/credits/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selected.id, amount: parsed, description }),
      });
      const data = await res.json();
      if (res.ok) {
        const newBalance = (selected.creditWallet?.balance ?? 0) + parsed;
        setSelected((prev) => prev ? { ...prev, creditWallet: { balance: newBalance } } : prev);
        setMessage({
          type: "success",
          text: `${parsed > 0 ? "+" : ""}${parsed} credits — số dư mới: ${newBalance}`,
        });
        setAmount("");
        setDescription("");
      } else {
        setMessage({ type: "error", text: data.error ?? "Có lỗi xảy ra" });
      }
    } catch {
      setMessage({ type: "error", text: "Không thể kết nối server" });
    } finally {
      setLoading(false);
    }
  };

  const amtNum = parseInt(amount) || 0;

  return (
    <div>
      <h1 className="admin-page-title">Credit Management</h1>

      <div className="credit-mgmt-grid">

        {/* ── Left: search + form ── */}
        <div className="admin-form-container credit-mgmt-panel">
          <h2 className="admin-form-title">Nạp / Trừ Credits</h2>

          {/* Search */}
          <div className="admin-form-group credit-search-wrap">
            <label className="admin-label">Tìm user</label>
            <div className="credit-search-input-wrap">
              <Search size={15} className="credit-search-icon" />
              <input
                value={query}
                onChange={handleQueryChange}
                placeholder="Nhập tên hoặc email..."
                className="admin-input credit-search-input"
                autoComplete="off"
              />
              {searching && <Loader2 size={15} className="credit-search-spinner" />}
            </div>

            {/* Dropdown results */}
            {results.length > 0 && (
              <div className="credit-search-dropdown">
                {results.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => selectUser(u)}
                    className="credit-search-result"
                  >
                    <User size={14} className="credit-search-result-icon" />
                    <div className="credit-search-result-info">
                      <span className="credit-search-result-name">{u.name ?? "(no name)"}</span>
                      <span className="credit-search-result-email">{u.email}</span>
                    </div>
                    <span className="credit-search-result-balance">
                      {u.creditWallet?.balance ?? 0} cr
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected user info card */}
          {selected && (
            <div className="credit-user-card">
              <Coins size={16} className="credit-user-card-icon" />
              <div className="credit-user-card-info">
                <span className="credit-user-card-name">{selected.name}</span>
                <span className="credit-user-card-meta">
                  {selected.email} · {selected.subscription?.plan?.name ?? "Free"}
                </span>
              </div>
              <div className="credit-user-card-balance">
                {selected.creditWallet?.balance ?? 0}
                <span className="credit-user-card-balance-unit">cr</span>
              </div>
            </div>
          )}

          {/* Adjust form */}
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-label">Số credits (+ nạp / − trừ)</label>
              <div className="credit-amount-row">
                <button
                  type="button"
                  className="credit-sign-btn credit-sign-btn--plus"
                  onClick={() => setAmount((v) => String(Math.abs(parseInt(v) || 0)))}
                >
                  <Plus size={14} />
                </button>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50"
                  required
                  className="admin-input"
                />
                <button
                  type="button"
                  className="credit-sign-btn credit-sign-btn--minus"
                  onClick={() => setAmount((v) => String(-Math.abs(parseInt(v) || 0)))}
                >
                  <Minus size={14} />
                </button>
              </div>
              {amtNum !== 0 && selected && (
                <p className="credit-balance-preview">
                  Số dư sau: {(selected.creditWallet?.balance ?? 0) + amtNum} credits
                </p>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Lý do (bắt buộc)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ví dụ: Bonus khách hàng thân thiết"
                required
                className="admin-input"
              />
            </div>

            {message && (
              <div className={`credit-message credit-message--${message.type}`}>
                {message.type === "success"
                  ? <CheckCircle size={15} />
                  : <XCircle size={15} />
                }
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selected}
              className="admin-submit-btn"
            >
              {loading
                ? "Đang xử lý..."
                : amtNum < 0
                  ? `Trừ ${Math.abs(amtNum)} credits`
                  : `Nạp ${amtNum || "?"} credits`
              }
            </button>
          </form>
        </div>

        {/* ── Right: quick presets ── */}
        <div className="admin-form-container credit-mgmt-panel">
          <h2 className="admin-form-title">Nạp nhanh</h2>
          <p className="credit-preset-hint">
            Chọn user trước, rồi bấm preset để điền nhanh.
          </p>
          <div className="credit-preset-grid">
            {[
              { label: "+10 credits",  value: 10,   desc: "Thưởng nhỏ" },
              { label: "+50 credits",  value: 50,   desc: "Bù lỗi hệ thống" },
              { label: "+100 credits", value: 100,  desc: "Bonus tháng" },
              { label: "+500 credits", value: 500,  desc: "Gói premium trial" },
              { label: "−10 credits",  value: -10,  desc: "Hoàn tác nạp sai" },
              { label: "−50 credits",  value: -50,  desc: "Điều chỉnh" },
            ].map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => { setAmount(String(p.value)); setDescription(p.desc); }}
                className={`credit-preset-btn ${p.value > 0 ? "credit-preset-btn--add" : "credit-preset-btn--sub"}`}
              >
                <span className="credit-preset-label">{p.label}</span>
                <span className="credit-preset-desc">{p.desc}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}