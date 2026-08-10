"use client"
import Link from "next/link"
import { ArrowLeft, Undo2, Redo2, LayoutTemplate, Download, CheckCircle2, Loader2, Save, AlertCircle } from "lucide-react"

interface Props {
    title: string;
    onTitleChange: (t: string) => void;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
    saveError?: string | null;
    lastSavedAt?: Date | null;
    cvId: string;
    onExportPdf: () => void,
    isExporting: boolean,
    onUndo: () => void,
    onRedo: () => void,
    canUndo: boolean,
    canRedo: boolean,
    onShowTemplates: () => void
}

export default function EditorToolBar({
    title, onTitleChange, saving, saved, saveError, lastSavedAt,
    onExportPdf, isExporting, onUndo, onRedo, canUndo, canRedo, onShowTemplates, cvId,
}: Props) {
    return (
        <header className="print:hidden flex items-center justify-between px-4 h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10 shrink-0">
            {/* ── Left ── */}
            <div className="flex items-center gap-2 flex-1">
                <Link href="/dashboard" className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-colors" title="Về Dashboard">
                    <ArrowLeft size={18} />
                </Link>

                <div className="w-px h-5 bg-slate-200 mx-1" />

                <div className="flex items-center gap-1">
                    <button
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        onClick={onUndo}
                        disabled={!canUndo}
                        title="Hoàn tác (Ctrl+Z)"
                    >
                        <Undo2 size={16} />
                    </button>
                    <button
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        onClick={onRedo}
                        disabled={!canRedo}
                        title="Làm lại (Ctrl+Shift+Z)"
                    >
                        <Redo2 size={16} />
                    </button>
                </div>

                    <div className="w-px h-5 bg-slate-200 mx-1" />
                    <button 
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-violet-600 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 rounded-md transition-all"
                        onClick={onShowTemplates} 
                        title="Đổi template"
                    >
                        <LayoutTemplate size={16} />
                        Template
                    </button>
            </div>

            {/* ── Center: Title ── */}
            <div className="flex items-center justify-center flex-1">
                <input
                    className="bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-violet-100 dark:focus:ring-violet-900/30 rounded-md px-3 py-1.5 text-sm font-semibold text-center text-slate-800 dark:text-slate-200 transition-all outline-none w-64"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Tên CV..."
                    maxLength={80}
                />
            </div>

            {/* ── Right: Status + Export ── */}
            <div className="flex items-center justify-end gap-4 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    {saving ? (
                        <>
                            <Loader2 size={14} className="animate-spin text-violet-500" />
                            Đang lưu…
                        </>
                    ) : saveError ? (
                        <>
                            <AlertCircle size={14} className="text-red-500" />
                            <span className="text-red-600" title={saveError}>Lỗi lưu</span>
                        </>
                    ) : saved ? (
                        <>
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-emerald-600">
                                {lastSavedAt ? `Đã lưu lúc ${lastSavedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : "Đã lưu"}
                            </span>
                        </>
                    ) : (
                        <>
                            <Save size={14} />
                            Chưa lưu
                        </>
                    )}
                </div>

                <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 rounded-md shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={onExportPdf}
                    disabled={isExporting}
                    title="Xuất PDF"
                >
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isExporting ? "Đang xuất…" : "Xuất PDF"}
                </button>
            </div>
        </header>
    );
}
