import { z } from "zod"
import { DividerBlockData } from "@/lib/schemas/block.schema"

type DividerData = z.infer<typeof DividerBlockData>
type DividerStyle = DividerData["style"]

interface Props {
    data: DividerData
    onChange: (d: DividerData) => void
}

const STYLES: { value: DividerStyle; label: string; css: string }[] = [
    { value: "solid", label: "Liền nét", css: "solid" },
    { value: "dashed", label: "Đứt đoạn", css: "dashed" },
    { value: "dotted", label: "Chấm tròn", css: "dotted" },
]

export default function DividerBlockSettings({ data, onChange }: Props) {
    return (
        <div className="editor-section-form">
            <h3 className="form-section-title">Đường kẻ ngang</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {STYLES.map((s) => {
                    const isActive = data.style === s.value
                    return (
                        <button
                            key={s.value}
                            onClick={() => onChange({ style: s.value })}
                            style={{
                                display: "flex", flexDirection: "column", gap: "0.5rem",
                                padding: "0.75rem 1rem",
                                border: `1.5px solid ${isActive ? "var(--primary)" : "var(--border)"}`,
                                borderRadius: "var(--radius-md)",
                                background: isActive ? "var(--primary-dim)" : "transparent",
                                cursor: "pointer", textAlign: "left",
                                transition: "all var(--transition-fast)",
                            }}
                        >
                            <span style={{
                                fontSize: "0.875rem",
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? "var(--primary)" : "var(--text-secondary)",
                            }}>
                                {s.label}
                            </span>
                            <div style={{
                                borderTop: `2px ${s.css} ${isActive ? "var(--primary)" : "var(--border-hover)"}`,
                                width: "100%",
                            }} />
                        </button>
                    )
                })}
            </div>
            <div style={{ padding: "0.75rem 0" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                    Xem trước trên CV:
                </p>
                <hr style={{
                    border: "none",
                    borderTop: `1.5px ${data.style} var(--text-muted)`,
                    margin: 0,
                }} />
            </div>
        </div>
    )
}