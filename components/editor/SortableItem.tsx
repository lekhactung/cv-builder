"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Props {
  id: string;
  children: React.ReactNode;
  showHandle?: boolean;
}

export function SortableItem({ id, children, showHandle }: Props) {
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
      {showHandle ? (
        <button
          className="sortable-drag-handle"
          {...attributes}
          {...listeners}
          aria-label="Kéo để sắp xếp"
          tabIndex={-1}
          type="button"
          style={{ touchAction: "none" }}
        >
          <GripVertical size={16} />
        </button>
      ) : (
        <div className="sortable-drag-handle-placeholder" />
      )}
      <div className="sortable-item-content">{children}</div>
    </div>
  );
}
