"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Home, RotateCcw, ArrowRight } from "lucide-react";

function PaymentResult() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status"); 
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  // Navigate when countdown hits 0
  useEffect(() => {
    if (countdown === 0) {
      const dest = status === "success" ? "/dashboard" : "/";
      router.push(dest);
    }
  }, [countdown, status, router]);

  if (status === "success") {
    return (
      <div className="payment-result-card">
        {/* Icon */}
        <div className="payment-result-icon payment-result-icon--success">
          <CheckCircle size={40} strokeWidth={1.5} />
        </div>

        <h1 className="payment-result-title">Thanh toán thành công! </h1>
        <p className="payment-result-desc">
          Gói của bạn đã được kích hoạt. Tận hưởng tất cả tính năng cao cấp ngay bây giờ.
        </p>

        <div className="payment-result-countdown">
          <Clock size={14} />
          Tự động chuyển hướng sau <strong>{countdown}</strong> giây...
        </div>

        <div className="payment-result-actions">
          <button className="btn btn-primary btn-md" onClick={() => router.push("/dashboard")}>
            <ArrowRight size={16} />
            Vào Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="payment-result-card">
        <div className="payment-result-icon payment-result-icon--warning">
          <XCircle size={40} strokeWidth={1.5} />
        </div>

        <h1 className="payment-result-title">Thanh toán đã hủy</h1>
        <p className="payment-result-desc">
          Bạn đã hủy quá trình thanh toán. Không có khoản nào bị trừ khỏi tài khoản của bạn.
        </p>

        <div className="payment-result-countdown">
          <Clock size={14} />
          Tự động chuyển về trang chủ sau <strong>{countdown}</strong> giây...
        </div>

        <div className="payment-result-actions">
          <button className="btn btn-primary btn-md" onClick={() => router.push("/pricing")}>
            <RotateCcw size={16} />
            Thử lại
          </button>
          <button className="btn btn-ghost btn-md" onClick={() => router.push("/")}>
            <Home size={16} />
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Fallback — unknown status
  return (
    <div className="payment-result-card">
      <div className="payment-result-icon payment-result-icon--error">
        <XCircle size={40} strokeWidth={1.5} />
      </div>
      <h1 className="payment-result-title">Có lỗi xảy ra</h1>
      <p className="payment-result-desc">
        Không thể xác định trạng thái thanh toán. Vui lòng kiểm tra email hoặc liên hệ hỗ trợ.
      </p>
      <div className="payment-result-actions">
        <button className="btn btn-primary btn-md" onClick={() => router.push("/pricing")}>
          Thử lại
        </button>
        <button className="btn btn-ghost btn-md" onClick={() => router.push("/")}>
          <Home size={16} />
          Về trang chủ
        </button>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <div className="payment-result-page">
      <Suspense fallback={<div className="payment-result-card"><p>Đang tải...</p></div>}>
        <PaymentResult />
      </Suspense>
    </div>
  );
}
