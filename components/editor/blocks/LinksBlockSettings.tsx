import { z } from "zod"
import { LinkItemSchema, LinksBlockData } from "@/lib/schemas/block.schema"

type LinksData = z.infer<typeof LinksBlockData>
type LinkItem = z.infer<typeof LinkItemSchema>

interface Props {
    data: LinksData
    onChange: (d: LinksData) => void
}

const ICON_PRESETS = [
    { value: "link", label: "Link" },
    { value: "github", label: "GitHub" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "twitter", label: "Twitter" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Điện thoại" },
    { value: "website", label: "Website" },
    { value: "youtube", label: "YouTube" },
    { value: "behance", label: "Behance" },
    { value: "dribbble", label: "Dribbble" },
]

const newItem = (): LinkItem => ({
    id: crypto.randomUUID(),
    label: "",
    url: "",
    icon: "link"
})

export default function LinksBlockSettings({ data, onChange }: Props) {
    const items = data.items ?? []

    const add = () => onChange({ items: [...items, newItem()] })

    const remove = (id: string) => onChange({ items: items.filter((i) => i.id !== id) })

    const update = <K extends keyof LinkItem>(id: string, field: K, val: LinkItem[K]) =>
        onChange({ items: items.map((i) => i.id === id ? { ...i, [field]: val } : i) })

    return (
        <div className="editor-section-form">
            <div className="form-section-header">
                <h3 className="form-section-title">Liên kết</h3>
                <button className="btn btn-outline btn-sm" onClick={add}>+ Thêm</button>
            </div>
            {items.length === 0 && (
                <p className="form-empty-hint">Chưa có liên kết nào. Nhấn "+ Thêm" để bắt đầu.</p>
            )}
            {items.map((item, idx) => (
                <div key={item.id} className="editor-item-card">
                    <div className="editor-item-header">
                        <span className="editor-item-index">#{idx + 1}</span>
                        <button className="editor-item-remove" onClick={() => remove(item.id)} title="Xóa">✕</button>
                    </div>
                    <div className="form-row">
                        <div className="form-group" style={{ flex: "0 0 140px" }}>
                            <label className="form-label">Icon</label>
                            <select
                                className="form-input"
                                value={item.icon}
                                onChange={(e) => update(item.id, "icon", e.target.value)}
                            >
                                {ICON_PRESETS.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tên hiển thị</label>
                            <input
                                className="form-input"
                                value={item.label}
                                onChange={(e) => update(item.id, "label", e.target.value)}
                                placeholder="Portfolio, GitHub cá nhân..."
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">URL / Địa chỉ</label>
                        <input
                            className="form-input"
                            type="url"
                            value={item.url}
                            onChange={(e) => update(item.id, "url", e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}