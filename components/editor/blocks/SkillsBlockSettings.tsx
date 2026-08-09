import { z } from "zod"
import { SkillItemSchema, SkillsBlockData } from "@/lib/schemas/block.schema"
type SkillsData = z.infer<typeof SkillsBlockData>
type SkillsItem = z.infer<typeof SkillItemSchema>

interface Props {
    data: SkillsData,
    onChange: (d: SkillsData) => void
}

const newItem = (): SkillsItem => ({
    id: crypto.randomUUID(),
    name: "",
    level: 50,
})

export default function SkillsBlockSetting({ data, onChange }: Props) {
    const items = data.items ?? []
    const add = () => onChange({ items: [...items, newItem()] })
    const remove = (id: string) => onChange({
        items: items.filter((i) => i.id !== id)
    })
    const update = <K extends keyof SkillsItem>(id: string, field: K, val: SkillsItem[K]) =>
        onChange({
            items: items.map((i) => i.id === id ? { ...i, [field]: val } : i)
        })
    return (
        <div className="editor-section-form">
            <div className="form-section-header">
                <h3 className="form-section-title">Kỹ năng</h3>
                <button className="btn btn-outline btn-sm" onClick={add}>+ Thêm</button>
            </div>
            {items.length === 0 && (
                <p className="form-empty-hint">Chưa có kỹ năng nào. Nhấn "+ Thêm" để bắt đầu.</p>
            )}
            <div className="skills-list">
                {items.map((item) => (
                    <div key={item.id} className="editor-item-card" style={{ gap: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <input
                                className="form-input skill-name-input"
                                value={item.name}
                                onChange={(e) => update(item.id, "name", e.target.value)}
                                placeholder="React, Python, Photoshop..."
                            />
                            <button
                                className="editor-item-remove"
                                onClick={() => remove(item.id)}
                                title="Xóa"
                            >✕</button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <input
                                type="range"
                                min={0} max={100} step={5}
                                value={item.level}
                                onChange={(e) => update(item.id, "level", Number(e.target.value))}
                                style={{ flex: 1 }}
                            />
                            <span style={{
                                fontSize: "0.8125rem",
                                color: "var(--text-muted)",
                                width: "36px",
                                textAlign: "right",
                                flexShrink: 0,
                            }}>
                                {item.level}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}