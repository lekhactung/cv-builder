"use client";
import { SkillItem } from "@/lib/schemas/cv.schema";

interface Props { items: SkillItem[]; onChange: (items: SkillItem[]) => void; }

const LEVELS = [
  { value: "beginner",     label: "Cơ bản" },
  { value: "intermediate", label: "Trung bình" },
  { value: "advanced",     label: "Nâng cao" },
  { value: "expert",       label: "Chuyên gia" },
] as const;

const newItem = (): SkillItem => ({ id: crypto.randomUUID(), name: "", level: "intermediate" });

export default function SkillsSection({ items, onChange }: Props) {
  const add    = () => onChange([...items, newItem()]);
  const remove = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, field: keyof SkillItem, value: string) =>
    onChange(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  return (
    <div className="editor-section-form">
      <div className="form-section-header">
        <h3 className="form-section-title">⚡ Kỹ năng</h3>
        <button className="btn btn-outline btn-sm" onClick={add}>+ Thêm</button>
      </div>

      {items.length === 0 && (
        <p className="form-empty-hint">Thêm kỹ năng của bạn vào đây.</p>
      )}

      <div className="skills-list">
        {items.map((item) => (
          <div key={item.id} className="skill-row">
            <input
              className="form-input skill-name-input"
              value={item.name}
              onChange={(e) => update(item.id, "name", e.target.value)}
              placeholder="React, Python, Photoshop..."
            />
            <select
              className="form-input skill-level-select"
              value={item.level}
              onChange={(e) => update(item.id, "level", e.target.value)}
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <button className="editor-item-remove" onClick={() => remove(item.id)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
