"use client";
import { EducationItem } from "@/lib/schemas/cv.schema";

interface Props { items: EducationItem[]; onChange: (items: EducationItem[]) => void; }

const newItem = (): EducationItem => ({
  id: crypto.randomUUID(), school: "", degree: "", field: "",
  startDate: "", endDate: "", gpa: "", description: "",
});

export default function EducationSection({ items, onChange }: Props) {
  const add    = () => onChange([...items, newItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, field: keyof EducationItem, value: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div className="editor-section-form">
      <div className="form-section-header">
        <h3 className="form-section-title"> Học vấn</h3>
        <button className="btn btn-outline btn-sm" onClick={add}>+ Thêm</button>
      </div>

      {items.length === 0 && (
        <p className="form-empty-hint">Chưa có học vấn nào. Nhấn "+ Thêm" để bắt đầu.</p>
      )}

      {items.map((item, idx) => (
        <div key={item.id} className="editor-item-card">
          <div className="editor-item-header">
            <span className="editor-item-index">#{idx + 1}</span>
            <button className="editor-item-remove" onClick={() => remove(item.id)}>✕</button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Trường</label>
              <input className="form-input" value={item.school} onChange={(e) => update(item.id, "school", e.target.value)} placeholder="ĐH Bách Khoa HN" />
            </div>
            <div className="form-group">
              <label className="form-label">Bằng cấp</label>
              <input className="form-input" value={item.degree} onChange={(e) => update(item.id, "degree", e.target.value)} placeholder="Cử nhân" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ngành học</label>
              <input className="form-input" value={item.field} onChange={(e) => update(item.id, "field", e.target.value)} placeholder="Công nghệ thông tin" />
            </div>
            <div className="form-group">
              <label className="form-label">GPA</label>
              <input className="form-input" value={item.gpa} onChange={(e) => update(item.id, "gpa", e.target.value)} placeholder="3.5/4.0" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Từ năm</label>
              <input className="form-input" type="month" value={item.startDate} onChange={(e) => update(item.id, "startDate", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Đến năm</label>
              <input className="form-input" type="month" value={item.endDate} onChange={(e) => update(item.id, "endDate", e.target.value)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
