"use client"
import { useState } from "react"
import {
    DndContext, PointerSensor, useSensor, useSensors,
    DragEndEvent, closestCenter,
} from "@dnd-kit/core"
import {
    SortableContext, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable"
import { useEditorStore } from "@/lib/stores/editorStore"
import { SortableItem } from "./SortableItem"
import BlockPicker from "./BlockPicker"
import BlockCard from "./BlockCard"
import { Plus, LayoutGrid } from "lucide-react"

interface Props {
    columnId: string
}

export default function BlockCanvas({ columnId }: Props) {
    const [showPicker, setShowPicker] = useState(false)
    const { document, reorderBlocks, selectBlock } = useEditorStore()
    const column = document?.columns?.find((c) => c.id === columnId)
    const blocks = column?.blocks ?? []

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIdx = blocks.findIndex((b) => b.id === active.id)
        const newIdx = blocks.findIndex((b) => b.id === over.id)
        reorderBlocks(columnId, arrayMove(blocks, oldIdx, newIdx).map((b) => b.id))
    }

    return (
        <div className="flex flex-col gap-2">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-6 mb-2 text-slate-400 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg text-center gap-2">
                            <LayoutGrid size={24} className="opacity-50" />
                            <span className="text-sm font-medium">Kéo thả hoặc thêm block mới để bắt đầu</span>
                        </div>
                    ) : (
                        blocks.map((block) => (
                            <SortableItem key={block.id} id={block.id} showHandle>
                                <BlockCard
                                    block={block}
                                    columnId={columnId}
                                    onClick={() => selectBlock(block.id, columnId)}
                                />
                            </SortableItem>
                        ))
                    )}
                </SortableContext>
            </DndContext>
            <button
                className="flex items-center justify-center gap-2 w-full p-2.5 text-sm font-semibold text-slate-500 bg-white border border-dashed border-slate-300 rounded-lg hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-all"
                onClick={() => setShowPicker(true)}
            >
                <Plus size={16} />
                Thêm block
            </button>
            {showPicker && (
                <BlockPicker columnId={columnId} onClose={() => setShowPicker(false)} />
            )}
        </div>
    )
}