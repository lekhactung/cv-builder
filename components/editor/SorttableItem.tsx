"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

interface Props {
    id: string;
    children: React.ReactNode;
}

export function SortableItem({ id, children }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : "auto",
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            {/* Drag handle */}
            <button
                {...attributes}
                {...listeners}
                className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-gray-400 transition"
                aria-label="Kéo để sắp xếp"
            >
                <GripVertical size={16} />
            </button>
            {children}
        </div>
    );
}