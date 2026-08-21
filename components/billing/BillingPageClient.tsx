"use client";

import { useState } from "react";
import { CreditCard, Zap, History, ExternalLink, AlertCircle, Info } from "lucide-react";
import { cancelSubscriptionAction } from "@/lib/actions/subscription";

interface Props {
  subscription: any;
  balance: number;
  transactions: any[];
  payments: any[];
}

const CREDIT_TYPE_LABELS: Record<string, string> = {
  SUBSCRIPTION_GRANT: "Cấp từ subscription",
  AI_REWRITE:         "AI viết lại",
  AI_GENERATION:      "AI tạo nội dung",
  REFUND:             "Hoàn trả",
  ADMIN_ADJUSTMENT:   "Admin điều chỉnh",
  EXPIRATION:         "Hết hạn",
  PURCHASE:           "Mua credits",
  ROLLOVER:           "Chuyển kỳ",
};

export default function BillingPageClient({ subscription, balance, transactions, payments }: Props) {
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage]       = useState<string | null>(null);

  const handleCancel = async () => {
    if (!confirm("Bạn có chắc muốn hủy subscription? Bạn vẫn có thể dùng đến hết kỳ.")) return;
    setCancelling(true);
    try {
      await cancelSubscriptionAction();
      setMessage("Subscription sẽ hủy vào cuối kỳ hiện tại.");
      window.location.reload();
    } catch (err: any) {
      setMessage("Lỗi: " + err.message);
    } finally {
      setCancelling(false);
    }
  };

  const handleManagePortal = async () => {
    const res  = await fetch("/api/payments/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  return (
    <div className="billing-page">
      <div className="billing-header">
        <h1 className="billing-title">Billing & Subscription</h1>
        <p className="billing-subtitle">Quản lý gói cước và tín dụng AI của bạn</p>
      </div>

      {message && (
        <div className="billing-message">
          <Info size={16} />
          {message}
        </div>
      )}

      <div className="billing-grid">
        {/* Current Plan Card */}
        <div className="billing-card billing-card--plan">
          <div className="billing-card-header">
            <CreditCard size={18} className="billing-card-icon" />
            <h2 className="billing-card-title">Gói hiện tại</h2>
          </div>

          {subscription ? (
            <>
              <div className="billing-plan-name">
                {subscription.plan?.name ?? "Free"}
              </div>
              <div className="billing-plan-status">
                Trạng thái: <strong>{subscription.status}</strong>
                {subscription.currentPeriodEnd && (
                  <> · Gia hạn: <strong>{new Date(subscription.currentPeriodEnd).toLocaleDateString("vi-VN")}</strong></>
                )}
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="billing-plan-alert">
                  <AlertCircle size={14} />
                  Subscription sẽ tự động hủy vào {new Date(subscription.currentPeriodEnd).toLocaleDateString("vi-VN")}
                </div>
              )}

              <div className="billing-actions">
                {subscription.provider === "STRIPE" && (
                  <button onClick={handleManagePortal} className="billing-btn billing-btn-portal">
                    <ExternalLink size={14} /> Quản lý thanh toán
                  </button>
                )}
                {subscription.status === "ACTIVE" && !subscription.cancelAtPeriodEnd && (
                  <button onClick={handleCancel} disabled={cancelling} className="billing-btn billing-btn-cancel">
                    {cancelling ? "Đang xử lý..." : "Hủy subscription"}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div>
              <p className="billing-plan-status">Bạn đang dùng gói mặc định</p>
              <a href="/pricing" className="billing-btn billing-btn-upgrade" style={{ display: "inline-flex" }}>
                Nâng cấp tài khoản
              </a>
            </div>
          )}
        </div>

        {/* Credits Card */}
        <div className="billing-card billing-card--credits">
          <div className="billing-card-header">
            <Zap size={18} className="billing-card-icon" />
            <h2 className="billing-card-title">AI Credits</h2>
          </div>
          <div className="billing-credits-balance">
            {new Intl.NumberFormat("vi-VN").format(balance)}
          </div>
          <div className="billing-credits-label">
            tín dụng khả dụng
          </div>
        </div>
      </div>

      {/* Credit Transactions */}
      <div className="billing-section">
        <div className="billing-section-header">
          <History size={18} />
          <h2 className="billing-section-title">Lịch sử tín dụng AI</h2>
        </div>
        
        {transactions.length === 0 ? (
          <p className="billing-subtitle">Chưa có giao dịch tín dụng nào.</p>
        ) : (
          <div className="billing-table-wrapper">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Loại giao dịch</th>
                  <th style={{ textAlign: "right" }}>Thay đổi</th>
                  <th style={{ textAlign: "right" }}>Số dư cuối</th>
                  <th style={{ textAlign: "right" }}>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div>{CREDIT_TYPE_LABELS[t.type] ?? t.type}</div>
                      {t.description && (
                        <div className="billing-table-desc">{t.description}</div>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }} className={t.amount > 0 ? "billing-amount--plus" : "billing-amount--minus"}>
                      {t.amount > 0 ? "+" : ""}{t.amount}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)" }}>
                      {t.balanceAfter}
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                      {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="billing-section">
        <div className="billing-section-header">
          <CreditCard size={18} />
          <h2 className="billing-section-title">Lịch sử thanh toán</h2>
        </div>

        {payments.length === 0 ? (
          <p className="billing-subtitle">Chưa có giao dịch thanh toán nào.</p>
        ) : (
          <div className="billing-table-wrapper">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Gói</th>
                  <th style={{ textAlign: "right" }}>Số tiền</th>
                  <th style={{ textAlign: "right" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8125rem" }}>
                      {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td style={{ fontWeight: 500 }}>{p.plan?.name ?? "—"}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      {new Intl.NumberFormat("vi-VN").format(p.amount)}₫
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span className={`billing-badge ${p.status === "COMPLETED" ? "billing-badge--success" : "billing-badge--error"}`}>
                        {p.status === "COMPLETED" ? "Thành công" : p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}