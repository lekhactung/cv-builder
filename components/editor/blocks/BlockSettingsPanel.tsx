"use client"
import { useEditorStore } from "@/lib/stores/editorStore"
import type { Block } from "@/lib/schemas/block.schema"
import TextBlockSettings from "./TextBlockSettings"
import TimeLineBlockSettings from "./TimeLineBlockSettings"
import DividerBlockSettings from "./DividerBlockSetting"
import LinksBlockSettings from "./LinksBlockSettings"
import SkillsBlockSettings from "./SkillsBlockSettings"
import TagsBlockSettings from "./TagsBlockSettings"

export default function BlockSettingsPanel() {
    const { document, selectedBlockId, selectedColumnId, updateBlock } = useEditorStore()
    if (!selectedBlockId || !selectedColumnId) {
        return (
            <div style={{ padding: "2rem 1 rem", textAlign: "center", color: "var(--text-muted)" }}>
                <p>Chọn một block để chỉnh sửa.</p>
            </div>
        )
    }

    const col = document.columns.find((c) => c.id === selectedColumnId)
    const block = col?.blocks.find((b) => b.id === selectedBlockId)

    if (!block) return null

    const handleChange = (newData: Block["data"]) =>
        updateBlock(selectedColumnId, selectedBlockId, (b) => ({ ...b, data: newData } as Block))

    return (
        <div style={{ padding: "1rem", overflowY: "auto", height: "100%" }}>
            
            {block.type === "text" && <TextBlockSettings data={block.data as any} onChange={handleChange} />}
            {block.type === "timeline" && <TimeLineBlockSettings data={block.data as any} onChange={handleChange} />}
            {block.type === "skills" && <SkillsBlockSettings data={block.data as any} onChange={handleChange} />}
            {block.type === "tags" && <TagsBlockSettings data={block.data as any} onChange={handleChange} />}
            {block.type === "links" && <LinksBlockSettings data={block.data as any} onChange={handleChange} />}
            {block.type === "divider" && <DividerBlockSettings data={block.data as any} onChange={handleChange} />}
         
            {block.type === "header" && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", padding: "0.5rem" }}>
                    Chỉnh sửa thông tin cá nhân trong panel bên trái.
                </p>
            )}
            {block.type === "spacer" && (
                <div className="form-group">
                    <label className="form-label">Chiều cao (px)</label>
                    <input
                        type="number"
                        className="form-input"
                        min={4} max={200} step={4}
                        value={(block.data as any).height ?? 16}
                        onChange={(e) => handleChange({ height: Number(e.target.value) })}
                    />
                    <div style={{
                        marginTop: "0.75rem",
                        height: `${(block.data as any).height ?? 16}px`,
                        background: "var(--primary-dim)",
                        border: "1px dashed var(--primary)",
                        borderRadius: "var(--radius-sm)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--primary)" }}>
                            {(block.data as any).height ?? 16}px
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}