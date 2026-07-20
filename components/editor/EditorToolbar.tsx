"use client"
import Link from "next/link"
import { boolean } from "zod";

interface Props {
    title: string;
    onTitleChange: (t: string) => void;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
    cvId: string;
    onExportPdf: () => void,
    isExporting: boolean,
}

export default function EditorToolBar({
    title,
    onTitleChange,
    onSave,
    saving,
    saved,
    cvId,
    onExportPdf,
    isExporting,
}: Props) {
    return (
        <header className="editor-toolbar">
            {/* Back button */}
            <Link href="/dashboard" className="editor-back-btn" title="Về Dashboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
            </Link>
            {/* Editable title */}
            <input
                className="editor-title-input"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Tên CV..."
                maxLength={80}
            />
            {/* Status + Actions */}
            <div className="editor-toolbar-actions">
                <span className={`editor-save-status${saved ? " saved" : ""}`}>
                    {saving ? "Đang lưu..." : saved ? "✓ Đã lưu" : "Chưa lưu"}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={onSave} disabled={saving || saved}>
                    Lưu
                </button>
                <button
                    className="btn btn-outline btn-sm"
                    onClick={onExportPdf}
                    disabled={isExporting}
                    title="Xuất PDF"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 6 2 18 2 18 9" />
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    PDF
                </button>
            </div>
        </header>
    );
}