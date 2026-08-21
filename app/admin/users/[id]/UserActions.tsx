"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Coins, ShieldAlert } from "lucide-react";

interface UserActionsProps {
    userId: string;
    currentRole: string;
    currentBalance: number;
}

export function UserActions({ userId, currentRole, currentBalance }: UserActionsProps) {
    const router = useRouter();

    // Credit adjustment
    const [creditAmount, setCreditAmount] = useState("");
    const [creditDesc, setCreditDesc] = useState("");
    const [creditLoading, setCreditLoading] = useState(false);
    const [creditMsg, setCreditMsg] = useState<{ ok: boolean; text: string } | null>(null);

    // Role change
    const [role, setRole] = useState(currentRole);
    const [roleLoading, setRoleLoading] = useState(false);
    const [roleMsg, setRoleMsg] = useState<{ ok: boolean; text: string } | null>(null);

    async function handleCreditAdjust(e: React.FormEvent) {
        e.preventDefault();
        setCreditLoading(true);
        setCreditMsg(null);
        try {
            const res = await fetch("/api/admin/credits/adjust", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    amount: parseInt(creditAmount),
                    description: creditDesc,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setCreditMsg({ ok: true, text: "Credits đã được điều chỉnh!" });
                setCreditAmount("");
                setCreditDesc("");
                router.refresh();
            } else {
                setCreditMsg({ ok: false, text: data.error ?? "Lỗi không xác định" });
            }
        } catch {
            setCreditMsg({ ok: false, text: "Lỗi kết nối" });
        } finally {
            setCreditLoading(false);
        }
    }

    async function handleRoleChange(e: React.FormEvent) {
        e.preventDefault();
        setRoleLoading(true);
        setRoleMsg(null);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role }),
            });
            const data = await res.json();
            if (res.ok) {
                setRoleMsg({ ok: true, text: "Role đã được cập nhật!" });
                router.refresh();
            } else {
                setRoleMsg({ ok: false, text: data.error ?? "Lỗi không xác định" });
            }
        } catch {
            setRoleMsg({ ok: false, text: "Lỗi kết nối" });
        } finally {
            setRoleLoading(false);
        }
    }

    return (
        <div className="user-detail-actions-grid">
            {/* Adjust Credits */}
            <div className="user-detail-card">
                <div className="user-detail-card-header">
                    <span className="user-detail-card-icon"><Coins size={18} /></span>
                    <h3 className="user-detail-card-title">Điều chỉnh Credits</h3>
                </div>
                <div className="user-detail-balance-display">
                    <span className="user-detail-balance-label">Số dư hiện tại</span>
                    <span className="user-detail-balance-value">{currentBalance.toLocaleString()}</span>
                </div>
                <form onSubmit={handleCreditAdjust} className="user-detail-form">
                    <div className="user-detail-field">
                        <label className="user-detail-label">
                            Số lượng <span style={{ color: "#9ca3af", fontSize: 12 }}>(âm để trừ)</span>
                        </label>
                        <input
                            type="number"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(e.target.value)}
                            placeholder="ví dụ: 100 hoặc -50"
                            className="user-detail-input"
                            required
                        />
                    </div>
                    <div className="user-detail-field">
                        <label className="user-detail-label">Lý do</label>
                        <input
                            type="text"
                            value={creditDesc}
                            onChange={(e) => setCreditDesc(e.target.value)}
                            placeholder="Nhập lý do điều chỉnh..."
                            className="user-detail-input"
                            required
                        />
                    </div>
                    {creditMsg && (
                        <div className={`user-detail-msg ${creditMsg.ok ? "user-detail-msg-ok" : "user-detail-msg-err"}`}>
                            {creditMsg.text}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={creditLoading}
                        className="user-detail-btn"
                    >
                        {creditLoading ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                </form>
            </div>

            {/* Change Role */}
            <div className="user-detail-card">
                <div className="user-detail-card-header">
                    <span className="user-detail-card-icon"><ShieldAlert size={18} /></span>
                    <h3 className="user-detail-card-title">Thay đổi Role</h3>
                </div>
                <form onSubmit={handleRoleChange} className="user-detail-form">
                    <div className="user-detail-field">
                        <label className="user-detail-label">Role hiện tại</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="user-detail-input"
                        >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                        </select>
                    </div>
                    {roleMsg && (
                        <div className={`user-detail-msg ${roleMsg.ok ? "user-detail-msg-ok" : "user-detail-msg-err"}`}>
                            {roleMsg.text}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={roleLoading || role === currentRole}
                        className="user-detail-btn"
                        style={{ opacity: role === currentRole ? 0.5 : 1 }}
                    >
                        {roleLoading ? "Đang cập nhật..." : "Cập nhật Role"}
                    </button>
                </form>
            </div>
        </div>
    );
}
