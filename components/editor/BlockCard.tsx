"use client";
import { Block } from "@/lib/schemas/block.schema";
import { useEditorStore } from "@/lib/stores/editorStore";
import {
  User,
  AlignLeft,
  CalendarRange,
  Zap,
  Tags,
  Link as LinkIcon,
  Minus,
  MoveVertical,
  Eye,
  EyeOff,
  Copy,
  Trash2,
} from "lucide-react";
import styles from "./Editor.module.css";

interface Props {
  block: Block;
  columnId: string;
  onClick: () => void;
}
const TYPES = {
  header: { name: "Thông tin cá nhân", icon: User },
  text: { name: "Đoạn văn bản", icon: AlignLeft },
  timeline: { name: "Kinh nghiệm / Học vấn", icon: CalendarRange },
  skills: { name: "Kỹ năng", icon: Zap },
  tags: { name: "Danh sách kỹ năng", icon: Tags },
  links: { name: "Liên kết", icon: LinkIcon },
  divider: { name: "Đường phân cách", icon: Minus },
  spacer: { name: "Khoảng cách", icon: MoveVertical },
};

export default function BlockCard({ block, columnId, onClick }: Props) {
  const { selectedBlockId, removeBlock, toggleBlockVisible, duplicateBlock } = useEditorStore();
  const { name, icon: Icon } = TYPES[block.type];
  const label = block.label || name;
  return (
    <div
      className={styles.blockRow}
      data-selected={selectedBlockId === block.id}
      data-hidden={!block.visible}
    >
      <button
        type="button"
        className={styles.blockSelect}
        onClick={onClick}
        aria-pressed={selectedBlockId === block.id}
        title={`Chỉnh sửa ${label}`}
      >
        <span className={styles.blockIcon}>
          <Icon size={16} />
        </span>
        <span className={styles.blockText}>
          <strong>{label}</strong>
          <small>{block.visible ? name : "Đang ẩn trên CV"}</small>
        </span>
      </button>
      <div className={styles.blockActions}>
        <button
          type="button"
          onClick={() => toggleBlockVisible(columnId, block.id)}
          title={block.visible ? "Ẩn mục" : "Hiện mục"}
          aria-label={`${block.visible ? "Ẩn" : "Hiện"} ${label}`}
        >
          {block.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          type="button"
          onClick={() => duplicateBlock(columnId, block.id)}
          title="Nhân bản mục"
          aria-label={`Nhân bản ${label}`}
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          title="Xóa mục"
          aria-label={`Xóa ${label}`}
          onClick={() => {
            if (window.confirm(`Xóa mục “${label}” khỏi CV? Bạn có thể hoàn tác sau khi xóa.`))
              removeBlock(columnId, block.id);
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
