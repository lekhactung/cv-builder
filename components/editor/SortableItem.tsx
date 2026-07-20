"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Props {
  id: string;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`sortable-item${isDragging ? " sortable-item--dragging" : ""}`}
    >
      <button
        className="sortable-drag-handle"
        {...attributes}
        {...listeners}
        aria-label="Kéo để sắp xếp"
        tabIndex={-1}
        type="button"
      >
        <GripVertical size={15} />
      </button>

      <div className="sortable-item-content">{children}</div>
    </div>
  );
}
