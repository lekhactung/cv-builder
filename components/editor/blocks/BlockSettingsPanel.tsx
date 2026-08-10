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
            <div className="px-8 py-8 text-center text-slate-400 dark:text-slate-500">
                <p className="text-sm">Chọn một block để chỉnh sửa.</p>
            </div>
        )
    }

    const col = document.columns.find((c) => c.id === selectedColumnId)
    const block = col?.blocks.find((b) => b.id === selectedBlockId)

    if (!block) return null

    const handleChange = (newData: Block["data"]) =>
        updateBlock(selectedColumnId, selectedBlockId, (b) => ({ ...b, data: newData } as Block))

    return (
        <div className="p-4 overflow-y-auto h-full">

            {block.type === "text" && <TextBlockSettings data={block.data as any} onChange={handleChange} />}
            {block.type === "timeline" && <TimeLineBlockSettings data={block.data as any} onChange={handleChange} />}
            {block.type === "skills" && <SkillsBlockSettings data={block.data as any} onChange={handleChange} />}
            {block.type === "tags" && <TagsBlockSettings data={block.data as any} onChange={handleChange} />}
            {block.type === "links" && <LinksBlockSettings data={block.data as any} onChange={handleChange} />}
            {block.type === "divider" && <DividerBlockSettings data={block.data as any} onChange={handleChange} />}

            {block.type === "header" && (
                <p className="text-sm text-slate-400 dark:text-slate-500 px-2 py-2">
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
                    {/* height is dynamic (JS value) — must keep inline style for this one property */}
                    <div
                        className="mt-3 border border-dashed border-violet-400 dark:border-violet-500 rounded bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center"
                        style={{ height: `${(block.data as any).height ?? 16}px` }}
                    >
                        <span className="text-xs text-violet-500 dark:text-violet-400">
                            {(block.data as any).height ?? 16}px
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}