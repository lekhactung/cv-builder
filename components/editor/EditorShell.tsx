"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useEditorStore } from "@/lib/stores/editorStore";
import { CvDocument } from "@/lib/schemas/block.schema";
import { updateCvAction, createCvAction } from "@/lib/actions/cv";
import { Layers, LayoutTemplate, MousePointer2, FileText } from "lucide-react";
import EditorToolbar from "./EditorToolbar";
import BlockCanvas from "./BlockCanvas";
import CvPreview from "./CvPreview";
import TemplatePicker from "./TemplatePicker";
import FreeformControls from "./freeform/FreeformControls";
import styles from "./Editor.module.css";

interface Props {
  cvId: string;
  initialTitle: string;
  initialTemplateName: string;
  initialTemplateId: string;
  initialDocument: CvDocument;
}

export default function EditorShell({
  cvId,
  initialTitle,
  initialTemplateName,
  initialTemplateId,
  initialDocument,
}: Props) {
  const {
    document,
    title,
    saved,
    saving,
    saveError,
    lastSavedAt,
    templateName,
    templateId,
    loadDocument,
    setTitle,
    setSaved,
    setSaving,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorStore();

  const [showTemplates, setShowTemplates] = useState(cvId === "new");
  const [currentCvId, setCurrentCvId] = useState(cvId);
  const [isExporting, setIsExporting] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"content" | "preview">("preview");
  const [zoom, setZoom] = useState("fit");
  const [exportError, setExportError] = useState<string | null>(null);
  const autoSaveTime = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loadedCvId = useRef<string | null>(null);

  const templateIdRef = useRef(templateId);
  const currentCvIdRef = useRef(currentCvId);
  useEffect(() => {
    templateIdRef.current = templateId;
  }, [templateId]);
  useEffect(() => {
    currentCvIdRef.current = currentCvId;
  }, [currentCvId]);

  useEffect(() => {
    // Server-action revalidation must not replace edits or clear undo history for this CV.
    if (loadedCvId.current === cvId) return;
    loadDocument(cvId, initialTitle, initialTemplateName, initialTemplateId, initialDocument);
    loadedCvId.current = cvId;
  }, [cvId, initialTitle, initialTemplateName, initialTemplateId, initialDocument, loadDocument]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  useEffect(() => {
    if (saved) return;
    clearTimeout(autoSaveTime.current);
    autoSaveTime.current = setTimeout(async () => {
      setSaving(true);
      useEditorStore.getState().setSaveError(null);

      const latestCvId = currentCvIdRef.current;
      const latestTemplateId = templateIdRef.current;
      try {
        if (latestCvId === "new") {
          const newId = await createCvAction(latestTemplateId, document, title);
          setCurrentCvId(newId);
          currentCvIdRef.current = newId;
          window.history.replaceState(null, "", `/editor/${newId}`);
        } else {
          await updateCvAction(latestCvId, document, title, latestTemplateId);
        }
        const latest = useEditorStore.getState();
        if (
          latest.document === document &&
          latest.title === title &&
          latest.templateId === latestTemplateId
        )
          setSaved(true);
        useEditorStore.getState().setLastSavedAt(new Date());
      } catch (err) {
        console.error("Autosave failed:", err);
        useEditorStore.getState().setSaveError("Lỗi kết nối. Không thể lưu CV.");
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => clearTimeout(autoSaveTime.current);
  }, [document, title, saved, setSaved, setSaving]);

  const handleExportPdf = useCallback(async () => {
    setExportError(null);
    setIsExporting(true);
    try {
      // Commit the active contenteditable before preparing the print layout.
      if (window.document.activeElement instanceof HTMLElement)
        window.document.activeElement.blur();
      await window.document.fonts.ready;
      await Promise.all(
        Array.from(window.document.querySelectorAll<HTMLImageElement>(".cv-a4-page img")).map(
          (image) => image.decode().catch(() => undefined),
        ),
      );
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      window.print();
    } catch {
      setExportError("Không thể mở cửa sổ xuất PDF. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleSelectBlock = (blockId: string) => {
    setMobilePanel("preview");
    requestAnimationFrame(() => {
      const block = window.document.getElementById(`cv-block-${blockId}`);
      block?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (document.layout === "freeform") block?.focus({ preventScroll: true });
      else
        block
          ?.querySelector<HTMLElement>('[contenteditable="true"]')
          ?.focus({ preventScroll: true });
    });
  };

  return (
    <div className={`${styles.shell} cv-editor-shell`} data-mobile-panel={mobilePanel}>
      <EditorToolbar
        title={title}
        onTitleChange={setTitle}
        saving={saving}
        saved={saved}
        saveError={saveError}
        lastSavedAt={lastSavedAt}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo()}
        canRedo={canRedo()}
      />
      <nav className={styles.mobileTabs} aria-label="Chế độ chỉnh sửa">
        <button
          type="button"
          aria-pressed={mobilePanel === "content"}
          onClick={() => setMobilePanel("content")}
        >
          <Layers size={16} />
          Các mục CV
        </button>
        <button
          type="button"
          aria-pressed={mobilePanel === "preview"}
          onClick={() => setMobilePanel("preview")}
        >
          <FileText size={16} />
          Chỉnh sửa CV
        </button>
      </nav>
      <div className={`${styles.workspace} cv-editor-workspace`}>
        {/* ── Left panel: block structure ── */}
        <aside className={styles.sidebar} aria-label="Các mục trong CV">
          <div className={styles.templateSummary}>
            <span className={styles.templateIcon}>
              <LayoutTemplate size={22} />
            </span>
            <div>
              <small>MẪU ĐANG DÙNG</small>
              <strong>{templateName}</strong>
            </div>
            <button type="button" onClick={() => setShowTemplates(true)}>
              Đổi mẫu
            </button>
          </div>
          <div className={styles.sidebarHeading}>
            <h2>Các mục trong CV</h2>
            <span>{document.columns.reduce((sum, col) => sum + col.blocks.length, 0)} mục</span>
          </div>
          <p className={styles.sidebarHint}>
            {document.layout === "freeform"
              ? "Kéo hộp chữ đến vị trí bạn muốn. Nhấp đúp để sửa; kéo góc dưới để đổi kích thước."
              : "Kéo để sắp xếp. Chọn một mục để chỉnh sửa trực tiếp trên CV."}
          </p>
          <div className={styles.sectionList}>
            {document.layout === "freeform" ? (
              <FreeformControls onSelectBlock={handleSelectBlock} />
            ) : (
              (document?.columns ?? []).map((col, idx) => (
                <div key={col.id} className={styles.columnSection}>
                  {(document?.columns ?? []).length > 1 && (
                    <div className={styles.columnHeading}>
                      <span>Cột {idx + 1}</span>
                      <span>{Math.round(col.width * 100)}%</span>
                    </div>
                  )}
                  <BlockCanvas columnId={col.id} onSelectBlock={handleSelectBlock} />
                </div>
              ))
            )}
            {(document?.columns ?? []).length === 0 && (
              <div className={styles.emptyState}>
                <LayoutTemplate size={30} />
                <p>Chọn một mẫu để bắt đầu CV của bạn.</p>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setShowTemplates(true)}
                >
                  Chọn mẫu CV
                </button>
              </div>
            )}
          </div>
          <p className={styles.sidebarFooter}>Thay đổi được lưu tự động sau khi chỉnh sửa.</p>
        </aside>

        {/* ── Center panel: editable CV preview ── */}
        <main
          className={`${styles.previewPanel} cv-editor-preview`}
          aria-label="Chỉnh sửa và xem trước CV"
        >
          <div className={styles.previewToolbar}>
            <div>
              <span className={styles.previewDot} />
              <strong>Chỉnh sửa trực tiếp</strong>
              <span className={styles.paperSize}>A4 · 210 × 297 mm</span>
            </div>
            <label className={styles.zoomLabel}>
              Thu phóng
              <select value={zoom} onChange={(event) => setZoom(event.target.value)}>
                <option value="fit">Vừa màn hình</option>
                <option value="0.75">75%</option>
                <option value="1">100%</option>
                <option value="1.25">125%</option>
              </select>
            </label>
          </div>
          {exportError && (
            <p role="alert" className={styles.exportError}>
              {exportError}
            </p>
          )}
          <div className={`${styles.previewScroll} cv-editor-scroll`}>
            <div className={styles.editHint}>
              <MousePointer2 size={14} />{" "}
              {document.layout === "freeform"
                ? "Kéo để đặt vị trí · Nhấp đúp để sửa chữ · Kéo góc dưới để đổi kích thước"
                : "Nhấp vào nội dung trên CV để chỉnh sửa"}
            </div>
            <CvPreview zoom={zoom} />
          </div>
        </main>
      </div>
      {showTemplates && <TemplatePicker onClose={() => setShowTemplates(false)} />}
    </div>
  );
}
