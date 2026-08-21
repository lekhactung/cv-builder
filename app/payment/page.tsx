"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const status       = searchParams.get("status"); // success | cancelled | failed
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer);
            router.push("/dashboard/billing");
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, router]);

  if (status === "success") {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <CheckCircle size={64} color="#22c55e" style={{ marginBottom: 20 }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Thanh toán thành công! 🎉</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            Tài khoản của bạn đang được kích hoạt. Quá trình này có thể mất vài giây.
          </p>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Tự động chuyển hướng sau {countdown} giây...
          </p>
          <button
            onClick={() => router.push("/dashboard/billing")}
            style={{
              marginTop: 20, padding: "12px 28px", borderRadius: 10,
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "white", border: "none", cursor: "pointer",
              fontSize: 15, fontWeight: 600,
            }}
          >
            Đến trang Billing
          </button>
        </div>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <Clock size={64} color="#f59e0b" style={{ marginBottom: 20 }} />
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Thanh toán đã hủy</h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            Bạn đã hủy quá trình thanh toán. Không có khoản nào bị trừ.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => router.push("/pricing")}
              style={{
                padding: "12px 28px", borderRadius: 10,
                background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "white", border: "none", cursor: "pointer",
                fontSize: 15, fontWeight: 600,
              }}
            >
              Thử lại
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "12px 28px", borderRadius: 10,
                border: "1px solid var(--border-primary)",
                background: "transparent", cursor: "pointer",
                fontSize: 15, fontWeight: 600, color: "var(--text-primary)",
              }}
            >
              Về Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <XCircle size={64} color="#ef4444" style={{ marginBottom: 20 }} />
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Thanh toán thất bại</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
          Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.
        </p>
        <button
          onClick={() => router.push("/pricing")}
          style={{
            padding: "12px 28px", borderRadius: 10,
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            color: "white", border: "none", cursor: "pointer",
            fontSize: 15, fontWeight: 600,
          }}
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Đang tải...</div>}>
      <PaymentResultContent />
    </Suspense>
  );
}