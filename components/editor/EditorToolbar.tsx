"use client";
import Link from "next/link";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  CheckCircle2,
  Loader2,
  Cloud,
  AlertCircle,
} from "lucide-react";
import styles from "./Editor.module.css";

interface Props {
  title: string;
  onTitleChange: (title: string) => void;
  saving: boolean;
  saved: boolean;
  saveError?: string | null;
  lastSavedAt?: Date | null;
  onExportPdf: () => void;
  isExporting: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function EditorToolbar({
  title,
  onTitleChange,
  saving,
  saved,
  saveError,
  lastSavedAt,
  onExportPdf,
  isExporting,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: Props) {
  const status = saving
    ? "Đang lưu…"
    : saveError
      ? "Không thể lưu CV"
      : saved
        ? "Đã lưu tự động"
        : "Đang chờ lưu…";
  return (
    <header className={styles.toolbar}>
      <Link
        href="/dashboard"
        className={styles.iconButton}
        aria-label="Về danh sách CV"
        title="Về danh sách CV"
      >
        <ArrowLeft size={20} />
      </Link>
      <div className={styles.documentInfo}>
        <input
          className={styles.titleInput}
          aria-label="Tên CV"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Đặt tên CV…"
          maxLength={80}
        />
        <span
          className={styles.saveStatus}
          data-error={Boolean(saveError)}
          role="status"
          title={
            saveError ||
            (lastSavedAt ? `Lưu gần nhất: ${lastSavedAt.toLocaleTimeString("vi-VN")}` : status)
          }
        >
          {saving ? (
            <Loader2 size={13} className="animate-spin" />
          ) : saveError ? (
            <AlertCircle size={13} />
          ) : saved ? (
            <CheckCircle2 size={13} />
          ) : (
            <Cloud size={13} />
          )}
          {status}
        </span>
      </div>
      <div className={styles.history} aria-label="Lịch sử chỉnh sửa">
        <button
          type="button"
          className={styles.iconButton}
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Hoàn tác"
          title="Hoàn tác (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Làm lại"
          title="Làm lại (Ctrl+Shift+Z)"
        >
          <Redo2 size={18} />
        </button>
      </div>
      <button
        type="button"
        className={styles.exportButton}
        onClick={onExportPdf}
        disabled={isExporting}
      >
        {isExporting ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
        {isExporting ? "Đang chuẩn bị…" : "Xuất PDF"}
      </button>
    </header>
  );
}
