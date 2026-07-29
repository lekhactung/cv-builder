"use client";
import { useState } from "react";
import { resetPassword, verifyResetCode } from "@/lib/actions/reset-password";
import { useRouter } from "next/navigation";
import Link from "next/link";

const maskEmail = (email: string) => {
  if (!email || !email.includes("@")) return email;
  const [name, domain] = email.split("@");
  return `${name.slice(0, 3)}****@${domain}`;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await resetPassword(email);
      if (res?.error) {
        setError(res.error);
      } else {
        setStep(2);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError("Vui lòng nhập đủ 6 số!");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await verifyResetCode(email, code);
      if (res?.error) {
        setError(res.error);
      } else {
        router.push(`/auth/new-password?email=${encodeURIComponent(email)}&code=${code}`);
      }
    } catch (err) {
      setError("Lỗi kết nối máy chủ, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6" style={{ background: "linear-gradient(135deg, #059669 0%, #10B981 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Khôi phục mật khẩu</h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email của bạn</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="name@example.com"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
              Mã xác nhận 6 số đã được gửi tới email <b>{maskEmail(email)}</b>.
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nhập mã xác nhận (6 số)</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, ""))
                }
                className="w-full px-4 py-2 border rounded-lg text-center text-xl tracking-[0.5em] focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="------"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
            >
              {loading ? "Đang xác nhận..." : "Xác nhận mã"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-sm text-violet-600 mt-2 hover:underline"
            >
              Sai email? Gửi lại
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/auth" className="text-sm text-gray-500 hover:text-violet-600">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
