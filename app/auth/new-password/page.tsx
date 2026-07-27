"use client";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { updatePassword } from "@/lib/actions/new-password";
import Link from "next/link";

function NewPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const email = searchParams.get("email");
  const code = searchParams.get("code");

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code) {
      setError("Thông tin không hợp lệ, vui lòng thực hiện lại từ đầu.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải dài ít nhất 6 ký tự.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await updatePassword(email, code, password);

    if (res?.error) {
      setError(res.error);
    } else {
      setSuccess(res.success || "Cập nhật thành công!");
      setTimeout(() => {
        router.push("/auth");
      }, 2000);
    }

    setLoading(false);
  };

  if (!email || !code) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">
          Thiếu thông tin xác thực!{" "}
          <Link href="/auth/forgot-password" className="underline">
            Thử lại
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2
          className="text-2xl font-bold text-center mb-6"
          style={{
            background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Đặt Mật Khẩu Mới
        </h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-600 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
            {success} Đang chuyển hướng...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Xác nhận đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      }
    >
      <NewPasswordForm />
    </Suspense>
  );
}
