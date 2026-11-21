import { useState } from "react";

function AIEnhanceButton() {
  // Khai báo state: giá trị hiện tại và hàm cập nhật
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  const handleEnhance = async () => {
    setLoading(true); // ← cập nhật state -> re-render
    const res = await fetch("/api/ai/enhance", {
      // TODO: Bổ sung cấu hình request cho ví dụ này.
    });
    const data = await res.json();
    setOptions(data.result); // ← cập nhật state -> re-render
    setLoading(false);
  };

  return (
    <button onClick={handleEnhance} disabled={loading}>
      {loading ? "Đang xử lý..." : " Viết lại đoạn văn bản bằng AI"}
    </button>
  );
}
