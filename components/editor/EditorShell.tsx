"use client"
import { useEffect, useState, useCallback, useRef } from "react"
import { useEditorStore } from "@/lib/stores/editorStore"
import { CvDocument } from "@/lib/schemas/block.schema"
import { updateCvAction, createCvAction } from "@/lib/actions/cv"
import { Layers } from "lucide-react"
import EditorToolbar from "./EditorToolbar"
import BlockCanvas from "./BlockCanvas"
import CvPreview from "./CvPreview"
import TemplatePicker from "./TemplatePicker"

interface Props {
  cvId: string
  initialTitle: string
  initialTemplateName: string
  initialTemplateId: string
  initialDocument: CvDocument
}

export default function EditorShell({ cvId, initialTitle, initialTemplateName, initialTemplateId, initialDocument }: Props) {
  const {
    document, title, saved, saving, saveError, lastSavedAt, templateName, templateId,
    loadDocument, setTitle, setSaved, setSaving,
    undo, redo, canUndo, canRedo,
  } = useEditorStore()

  const [showTemplates, setShowTemplates] = useState(cvId === "new")
  const [currentCvId, setCurrentCvId] = useState(cvId)
  const [isExporting, setIsExporting] = useState(false)
  const autoSaveTime = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const templateNameRef = useRef(templateName)
  const templateIdRef = useRef(templateId)
  const currentCvIdRef = useRef(currentCvId)
  useEffect(() => { templateNameRef.current = templateName }, [templateName])
  useEffect(() => { templateIdRef.current = templateId }, [templateId])
  useEffect(() => { currentCvIdRef.current = currentCvId }, [currentCvId])

  useEffect(() => {
    loadDocument(cvId, initialTitle, initialTemplateName, initialTemplateId, initialDocument)
  }, [cvId])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo])

  useEffect(() => {
    if (saved) return
    clearTimeout(autoSaveTime.current)
    autoSaveTime.current = setTimeout(async () => {
      setSaving(true)
      useEditorStore.getState().setSaveError(null)
    
      const latestCvId = currentCvIdRef.current
      const latestTemplateName = templateNameRef.current
      const latestTemplateId = templateIdRef.current
      try {
        if (latestCvId === "new") {
          const newId = await createCvAction(latestTemplateId, document as any, title)
          setCurrentCvId(newId)
          currentCvIdRef.current = newId
          window.history.replaceState(null, "", `/editor/${newId}`)
        } else {
          await updateCvAction(latestCvId, document as any, title, latestTemplateName)
        }
        setSaved(true)
        useEditorStore.getState().setLastSavedAt(new Date())
      } catch (err) {
        console.error("Autosave failed:", err)
        useEditorStore.getState().setSaveError("Lỗi kết nối. Không thể lưu CV.")
      } finally {
        setSaving(false)
      }
    }, 1500)
  }, [document, title, saved])

  const handleExportPdf = useCallback(async () => {
    setIsExporting(true)
    await new Promise((r) => setTimeout(r, 80))
    window.print()
    setIsExporting(false)
  }, [])

  return (
    <div className="flex flex-col h-screen print:h-auto print:block bg-slate-50 dark:bg-slate-900 overflow-hidden print:overflow-visible font-sans">
      <EditorToolbar
        title={title}
        onTitleChange={setTitle}
        onSave={() => {
          clearTimeout(autoSaveTime.current)
          useEditorStore.getState().setSaved(false)
        }}
        saving={saving}
        saved={saved}
        saveError={saveError}
        lastSavedAt={lastSavedAt}
        cvId={currentCvId}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo()}
        canRedo={canRedo()}
        onShowTemplates={() => setShowTemplates(true)}
      />
      <div className="flex flex-1 overflow-hidden print:overflow-visible print:block">
        {/* ── Left panel: block structure ── */}
        <aside className="print:hidden w-[300px] flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col z-10 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Layers size={16} className="text-indigo-500" />
              Cấu trúc CV
            </div>
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-100 rounded-full">
              {(document?.columns ?? []).reduce((sum, col) => sum + col.blocks.length, 0)} block
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {(document?.columns ?? []).map((col, idx) => (
              <div key={col.id} className="mb-4 last:mb-0">
                {(document?.columns ?? []).length > 1 && (
                  <div className="flex items-center justify-between px-1 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Cột {idx + 1}</span>
                    <span className="opacity-60">{Math.round(col.width * 100)}%</span>
                  </div>
                )}
                <BlockCanvas columnId={col.id} />
              </div>
            ))}
            {(document?.columns ?? []).length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400 dark:text-slate-500">
                <p className="text-sm">Chưa có cột nào.</p>
                <p className="text-xs mt-1">Hãy chọn Template để bắt đầu.</p>
              </div>
            )}
          </div>
        </aside>

        {/* ── Center panel: editable CV preview ── */}
        <main className="flex-1 overflow-y-auto print:overflow-visible bg-slate-50 dark:bg-slate-900 print:bg-white relative flex justify-center py-10 px-4 print:p-0 print:block editor-panel-center">
          <CvPreview />
        </main>
      </div>
      {showTemplates && <TemplatePicker onClose={() => setShowTemplates(false)} />}
    </div>
  )
}