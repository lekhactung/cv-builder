"use client"
import { BlockType } from "@/lib/schemas/block.schema"
import { createDefaultBlock } from "@/lib/blocks/default"
import { useEditorStore } from "@/lib/stores/editorStore"

const BLOCK_LIST: { type: BlockType; icon: string; label: string; desc: string }[] = [
    { type: "header", icon: "👤", label: "Thông tin", desc: "Tên, chức danh, liên hệ" },
    { type: "text", icon: "📝", label: "Văn bản", desc: "Đoạn giới thiệu tự do" },
    { type: "timeline", icon: "📅", label: "Timeline", desc: "Kinh nghiệm, học vấn" },
    { type: "skills", icon: "⚡", label: "Kỹ năng", desc: "Progress bar" },
    { type: "tags", icon: "🏷️", label: "Tags", desc: "Chip/tag kỹ năng" },
    { type: "links", icon: "🔗", label: "Liên kết", desc: "GitHub, LinkedIn..." },
    { type: "divider", icon: "─", label: "Divider", desc: "Đường kẻ ngang" },
    { type: "spacer", icon: "↕", label: "Khoảng trống", desc: "Tạo khoảng cách" },
]

interface Props {
    columnId: string
    onClose: () => void
}

export default function BlockPicker({ columnId, onClose }: Props) {
    const addBlock = useEditorStore((s) => s.addBlock)

    const handleAdd = (type: BlockType) => {
        addBlock(columnId, createDefaultBlock(type))
        onClose()
    }

    return (
        <div className="block-picker-overlay" onClick={onClose}>
            <div className="block-picker" onClick={(e) => e.stopPropagation()}>
                <h3 className="block-picker-title">Thêm Block</h3>
                <div className="block-picker-grid">
                    {BLOCK_LIST.map((b) => (
                        <button key={b.type} className="block-picker-item" onClick={() => handleAdd(b.type)}>
                            <span className="block-picker-icon">{b.icon}</span>
                            <span className="block-picker-label">{b.label}</span>
                            <span className="block-picker-desc">{b.desc}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}