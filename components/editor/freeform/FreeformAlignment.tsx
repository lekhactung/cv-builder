"use client";

import { useState } from "react";
import { useEditorStore } from "@/lib/stores/editorStore";
import {
  alignFreeformItems,
  distributeFreeformItems,
  getFreeformItems,
  type Alignment,
} from "@/lib/freeform-alignment";

const ALIGNMENTS: { value: Alignment; label: string }[] = [
  { value: "left", label: "Căn trái" },
  { value: "center-x", label: "Giữa ngang" },
  { value: "right", label: "Căn phải" },
  { value: "top", label: "Căn trên" },
  { value: "center-y", label: "Giữa dọc" },
  { value: "bottom", label: "Căn dưới" },
];

export default function FreeformAlignment() {
  const {
    document,
    selectedBlockIds,
    updateFrames,
    selectBlock,
    freeformSnap,
    freeformMargins,
    setFreeformSnap,
    setFreeformMargins,
  } = useEditorStore();
  const [scope, setScope] = useState<"selection" | "page">("selection");
  const [message, setMessage] = useState("");
  const items = getFreeformItems(document, selectedBlockIds);
  const target = items.length < 2 ? "page" : scope;

  function distribute(axis: "x" | "y") {
    const updates = distributeFreeformItems(items, axis);
    if (!updates) {
      setMessage("Không đủ chỗ để chia đều khoảng cách. Hãy giãn các hộp ra hoặc thu nhỏ khung.");
      return;
    }
    updateFrames(updates);
    setMessage(axis === "x" ? "Đã chia đều khoảng cách ngang." : "Đã chia đều khoảng cách dọc.");
  }

  return (
    <section className="cv-freeform-alignment" aria-label="Căn chỉnh và khoảng cách">
      <div className="cv-freeform-selection-count">
        <strong>Đã chọn {items.length} hộp</strong>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              selectBlock(null);
              setMessage("");
            }}
          >
            Bỏ chọn
          </button>
        )}
      </div>
      <p className="cv-freeform-help">
        Shift + nhấp để chọn nhiều hộp, hoặc dùng ô chọn trong danh sách. Kéo một hộp đã chọn để di
        chuyển cả nhóm.
      </p>
      <label className="cv-freeform-align-target">
        Căn theo
        <select
          value={target}
          onChange={(event) => {
            setScope(event.target.value as typeof scope);
            setMessage("");
          }}
        >
          <option value="selection" disabled={items.length < 2}>
            Các hộp đã chọn
          </option>
          <option value="page">Lề trang (48 px)</option>
        </select>
      </label>
      <div className="cv-freeform-align-buttons">
        {ALIGNMENTS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            disabled={!items.length}
            onClick={() => {
              updateFrames(alignFreeformItems(items, value, target));
              setMessage(
                `Đã ${label.toLowerCase()} ${target === "page" ? "theo lề trang" : "các hộp đã chọn"}.`,
              );
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="cv-freeform-fields">
        <button type="button" disabled={items.length < 3} onClick={() => distribute("x")}>
          Chia đều ngang
        </button>
        <button type="button" disabled={items.length < 3} onClick={() => distribute("y")}>
          Chia đều dọc
        </button>
      </div>
      {items.length < 3 && (
        <p className="cv-freeform-help">Chọn ít nhất 3 hộp để chia đều khoảng cách.</p>
      )}
      <label className="cv-freeform-check">
        <input
          type="checkbox"
          checked={freeformSnap}
          onChange={(event) => setFreeformSnap(event.target.checked)}
        />
        Hít vào đường gióng khi kéo
      </label>
      <label className="cv-freeform-check">
        <input
          type="checkbox"
          checked={freeformMargins}
          onChange={(event) => setFreeformMargins(event.target.checked)}
        />
        Hiện lề trang
      </label>
      <p className="cv-freeform-help">
        Giữ Alt khi kéo để tạm tắt hít. Đường hỗ trợ không xuất hiện trong PDF.
      </p>
      <p role="status" className="cv-freeform-alignment-status">
        {message}
      </p>
    </section>
  );
}
