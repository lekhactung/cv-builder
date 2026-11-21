"use client";

export default function ProfileError({ reset }: { reset: () => void }) {
  return (
    <main style={{ padding: "10rem 1.5rem", textAlign: "center" }}>
      <h1>Không thể tải cài đặt tài khoản</h1>
      <p>Vui lòng thử lại sau.</p>
      <button className="btn btn-primary" onClick={reset}>
        Thử lại
      </button>
    </main>
  );
}
