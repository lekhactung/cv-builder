"use client";
import { ExperienceItem } from "@/lib/schemas/cv.schema";

interface Props {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
}

const newItem = (): ExperienceItem => ({
  id: crypto.randomUUID(), company: "", position: "",
  startDate: "", endDate: "", current: false, location: "", description: "",
});

export default function ExperienceSection({ items, onChange }: Props) {
  const add    = () => onChange([...items, newItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, field: keyof ExperienceItem, value: string | boolean) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div className="editor-section-form">
      <div className="form-section-header">
        <h3 className="form-section-title">💼 Kinh nghiệm làm việc</h3>
        <button className="btn btn-outline btn-sm" onClick={add}>+ Thêm</button>
      </div>

      {items.length === 0 && (
        <p className="form-empty-hint">Chưa có kinh nghiệm nào. Nhấn "+ Thêm" để bắt đầu.</p>
      )}

      {items.map((item, idx) => (
        <div key={item.id} className="editor-item-card">
          <div className="editor-item-header">
            <span className="editor-item-index">#{idx + 1}</span>
            <button className="editor-item-remove" onClick={() => remove(item.id)} title="Xóa">✕</button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Công ty</label>
              <input className="form-input" value={item.company} onChange={(e) => update(item.id, "company", e.target.value)} placeholder="Google, Meta..." />
            </div>
            <div className="form-group">
              <label className="form-label">Vị trí</label>
              <input className="form-input" value={item.position} onChange={(e) => update(item.id, "position", e.target.value)} placeholder="Software Engineer" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Từ tháng</label>
              <input className="form-input" type="month" value={item.startDate} onChange={(e) => update(item.id, "startDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Đến tháng</label>
              <input className="form-input" type="month" value={item.endDate} onChange={(e) => update(item.id, "endDate", e.target.value)} disabled={item.current} />
              <label className="form-check" style={{ marginTop: "0.5rem" }}>
                <input type="checkbox" checked={item.current} onChange={(e) => update(item.id, "current", e.target.checked)} />
                Hiện tại
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả công việc</label>
            <textarea className="form-input form-textarea" value={item.description}
              onChange={(e) => update(item.id, "description", e.target.value)}
              placeholder="- Phát triển tính năng X...\n- Tối ưu performance..."
              rows={4}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
