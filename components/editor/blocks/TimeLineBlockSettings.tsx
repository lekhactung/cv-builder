import { TimelineItemSchema } from "@/lib/schemas/block.schema";

import type { z } from 'zod'

type TimeLineItem = z.infer<typeof TimelineItemSchema>
interface Props {
    data: { items: TimeLineItem[] }
    onChange: (d: { items: TimeLineItem[] }) => void
}

export default function TimeLineBlockSettings({ data, onChange }: Props) {
    const items = data.items ?? []
    const add = () => onChange({
        items: [...items, {
            id: crypto.randomUUID(), title: "",
            subtitle: "", startDate: "", endDate: "", current: false, description: ""
        }]
    })
    const remove = (id: string) => onChange({ items: items.filter((i) => i.id !== id) })
    const update = (id: string, field: keyof TimeLineItem, val: TimeLineItem[keyof TimeLineItem]) =>
        onChange({ items: items.map((i) => i.id === id ? { ...i, [field]: val } : i) })

    return (
        <div>
            {items.map((item, idx) => (
                <div key={item.id} className="editor-item-card">
                    <div className="editor-item-header">
                        <span>#{idx + 1}</span>
                        <button onClick={() => remove(item.id)}>✕</button>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Tiêu đề</label>
                            <input className="form-input" value={item.title} onChange={(e) => update(item.id, "title", e.target.value)} placeholder="Vị trí / Bằng cấp" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tổ chức</label>
                            <input className="form-input" value={item.subtitle} onChange={(e) => update(item.id, "subtitle", e.target.value)} placeholder="Công ty / Trường" />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Từ</label>
                            <input className="form-input" type="month" value={item.startDate} onChange={(e) => update(item.id, "startDate", e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Đến</label>
                            <input className="form-input" type="month" value={item.endDate} disabled={item.current} onChange={(e) => update(item.id, "endDate", e.target.value)} />
                            <label className="form-check" style={{ marginTop: "0.5rem" }}>
                                <input type="checkbox" checked={item.current} onChange={(e) => update(item.id, "current", e.target.checked)} />
                                Hiện tại
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Mô tả</label>
                        <textarea className="form-input form-textarea" rows={3} value={item.description} onChange={(e) => update(item.id, "description", e.target.value)} />
                    </div>
                </div>
            ))}
            <button className="btn btn-outline btn-sm" style={{ width: "100%", marginTop: "0.5rem" }} onClick={add}>+ Thêm mục</button>
        </div>
    )

}
