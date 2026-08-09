"use client"
import Link from "next/link"
import { ArrowLeft, Undo2, Redo2, LayoutTemplate, Download, CheckCircle2, Loader2, Save } from "lucide-react"

interface Props {
    title: string;
    onTitleChange: (t: string) => void;
    onSave: () => void;
    saving: boolean;
    saved: boolean;
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
    title, onTitleChange, saving, saved,
    onExportPdf, isExporting, onUndo, onRedo, canUndo, canRedo, onShowTemplates, cvId,
}: Props) {
    return (
        <header className="print:hidden flex items-center justify-between px-4 h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10 shrink-0">
            {/* ── Left ── */}
            <div className="flex items-center gap-2 flex-1">
                <Link href="/dashboard" className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Về Dashboard">
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

                {cvId === "new" && (
                    <>
                        <div className="w-px h-5 bg-slate-200 mx-1" />
                        <button 
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-md transition-all"
                            onClick={onShowTemplates} 
                            title="Đổi template"
                        >
                            <LayoutTemplate size={16} />
                            Template
                        </button>
                    </>
                )}
            </div>

            {/* ── Center: Title ── */}
            <div className="flex items-center justify-center flex-1">
                <input
                    className="bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 rounded-md px-3 py-1.5 text-sm font-semibold text-center text-slate-800 dark:text-slate-200 transition-all outline-none w-64"
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
                            <Loader2 size={14} className="animate-spin text-indigo-500" />
                            Đang lưu…
                        </>
                    ) : saved ? (
                        <>
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <span className="text-emerald-600">Đã lưu</span>
                        </>
                    ) : (
                        <>
                            <Save size={14} />
                            Chưa lưu
                        </>
                    )}
                </div>

                <button
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-md shadow-sm hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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