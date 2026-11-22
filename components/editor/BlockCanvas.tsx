"use client";
import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useEditorStore } from "@/lib/stores/editorStore";
import { SortableItem } from "./SortableItem";
import BlockPicker from "./BlockPicker";
import BlockCard from "./BlockCard";
import { Plus, LayoutGrid } from "lucide-react";
import styles from "./Editor.module.css";

interface Props {
  columnId: string;
  onSelectBlock: (blockId: string) => void;
}

export default function BlockCanvas({ columnId, onSelectBlock }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const { document, reorderBlocks, selectBlock } = useEditorStore();
  const column = document?.columns?.find((c) => c.id === columnId);
  const blocks = column?.blocks ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    reorderBlocks(
      columnId,
      arrayMove(blocks, oldIdx, newIdx).map((b) => b.id),
    );
  };

  return (
    <div className={styles.blockList}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.length === 0 ? (
            <div className={styles.emptyState}>
              <LayoutGrid size={24} />
              <span>Thêm một mục để bắt đầu.</span>
            </div>
          ) : (
            blocks.map((block) => (
              <SortableItem key={block.id} id={block.id} showHandle>
                <BlockCard
                  block={block}
                  columnId={columnId}
                  onClick={() => {
                    selectBlock(block.id, columnId);
                    onSelectBlock(block.id);
                  }}
                />
              </SortableItem>
            ))
          )}
        </SortableContext>
      </DndContext>
      <button type="button" className={styles.addBlock} onClick={() => setShowPicker(true)}>
        <Plus size={16} />
        Thêm mục mới
      </button>
      {showPicker && <BlockPicker columnId={columnId} onClose={() => setShowPicker(false)} />}
    </div>
  );
}
