"use client"
import { Block } from "@/lib/schemas/block.schema"
import { useEditorStore } from "@/lib/stores/editorStore"
import { User, AlignLeft, CalendarRange, Zap, Tags, Link as LinkIcon, Minus, MoveVertical, Eye, EyeOff, Copy, Trash2 } from "lucide-react"

interface Props {
    block: Block
    columnId: string
    onClick: () => void
}

const TYPE_STYLE: Record<string, { accent: string; icon: React.ReactNode }> = {
    header:  { accent: "border-indigo-500", icon: <User size={16} className="text-indigo-500" /> },
    text:    { accent: "border-blue-500", icon: <AlignLeft size={16} className="text-blue-500" /> },
    timeline:{ accent: "border-emerald-500", icon: <CalendarRange size={16} className="text-emerald-500" /> },
    skills:  { accent: "border-amber-500", icon: <Zap size={16} className="text-amber-500" /> },
    tags:    { accent: "border-cyan-500", icon: <Tags size={16} className="text-cyan-500" /> },
    links:   { accent: "border-rose-500", icon: <LinkIcon size={16} className="text-rose-500" /> },
    divider: { accent: "border-slate-500", icon: <Minus size={16} className="text-slate-500" /> },
    spacer:  { accent: "border-slate-400", icon: <MoveVertical size={16} className="text-slate-400" /> },
}

export default function BlockCard({ block, columnId, onClick }: Props) {
    const { selectedBlockId, removeBlock, toggleBlockVisible, duplicateBlock } = useEditorStore()
    const isSelected = selectedBlockId === block.id
    const cfg = TYPE_STYLE[block.type] ?? { accent: "border-slate-400", icon: <div className="w-4 h-4 bg-slate-200 rounded-sm" /> }

    return (
        <div
            className={`group flex items-center justify-between p-3 mb-2 rounded-lg border transition-all cursor-pointer bg-white relative overflow-hidden ${
                isSelected 
                    ? "border-indigo-500 shadow-sm ring-1 ring-indigo-500" 
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
            } ${!block.visible ? "opacity-60 grayscale-[0.5]" : ""}`}
            onClick={onClick}
        >
            {/* Accent left bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.accent} border-l-4`} />

            <div className="flex items-center gap-3 pl-2 flex-1 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-50 border border-slate-100 shrink-0">
                    {cfg.icon}
                </div>
                
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-slate-800 truncate">
                        {block.label || block.type}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                        {block.type}
                    </span>
                </div>
            </div>

            {/* Actions (visible on hover) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    onClick={(e) => { e.stopPropagation(); toggleBlockVisible(columnId, block.id) }}
                    title={block.visible ? "Ẩn" : "Hiện"}
                >
                    {block.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    onClick={(e) => { e.stopPropagation(); duplicateBlock(columnId, block.id) }}
                    title="Nhân đôi"
                >
                    <Copy size={14} />
                </button>
                <button
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    onClick={(e) => { e.stopPropagation(); removeBlock(columnId, block.id) }}
                    title="Xóa"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    )
}