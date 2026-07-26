"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { createCvAction, updateCvAction } from "@/lib/actions/cv";
import { CvData } from "@/lib/schemas/cv.schema";
import EditorToolbar from "./EditorToolbar";
import EditorForm from "./EditorForm";
import CvPreview from "./CvPreview";
import { usePdfExport } from "@/lib/pdf/usePdfExport";
import { SortableSectionList } from "./SortableSectionList";
import { SortableItem } from "./SortableItem";

type Section = "personal" | "experience" | "education" | "skills";

interface Props {
  cvId: string;
  initialTitle: string;
  initialData: CvData;
  initialTemplate: string;
}

export default function EditorShell({ cvId, initialTitle, initialData, initialTemplate }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [cvData, setCvData] = useState<CvData>(initialData);
  const [activeSection, setSection] = useState<Section>("personal");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { exportPdf, isExporting } = usePdfExport();
  const [currentCvId, setCurrentCvId] = useState(cvId);
  const [sectionOrder, setSectionOrder] = useState<string[]>(
    cvData.sectionOrder ?? ["personal", "experience", "education", "skills"]
  );

  const handleExportPdf = () => {
    exportPdf(cvData, initialTemplate, title);
  }
  const saveCv = useCallback(async (data: CvData, t: string) => {
    setSaving(true);
    try {
      if (currentCvId === "new") {
        const newId = await createCvAction(initialTemplate, data, t)
        setCurrentCvId(newId);
        window.history.replaceState(null, "", `/editor/${newId}`);
      }
      else {
        await updateCvAction(currentCvId, data, t);
      }
      setSaved(true);
    } catch (error) {
      console.error("Lỗi khi lưu CV: ", error);
    } finally {
      setSaving(false);
    }
  }, [currentCvId, initialTemplate]);

  const updateCvData = useCallback((updater: (prev: CvData) => CvData) => {
    setSaved(false);
    setCvData((prev) => {
      const next = updater(prev);
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => saveCv(next, title), 1500);
      return next;
    });
  }, [saveCv, title]);

  useEffect(() => {
    document.title = title || "Editor";
  }, [title]);

  const updateTitle = useCallback((t: string) => {
    setTitle(t);
    setSaved(false);
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveCv(cvData, t), 1500);
  }, [saveCv, cvData]);

  const handleSectionReorder = (newOrder: string[]) => {
    setSectionOrder(newOrder);
    updateCvData((prev) => ({ ...prev, sectionOrder: newOrder }));
  }

  const sections: { id: Section; label: string; icon: string }[] = [
    { id: "personal", label: "Hồ sơ", icon: "" },
    { id: "experience", label: "Kinh nghiệm", icon: "" },
    { id: "education", label: "Học vấn", icon: "" },
    { id: "skills", label: "Kỹ năng", icon: "" },
  ];

  const renderSection = (id: string) => (
    <div id={`section-${id}`}>
      <EditorForm
        key={id}
        section={id as Section}
        cvData={cvData}
        onUpdate={updateCvData}
      />
    </div>
  );

  return (
    <div className="editor-shell">
      <EditorToolbar
        title={title}
        onTitleChange={updateTitle}
        onSave={() => saveCv(cvData, title)}
        saving={saving}
        saved={saved}
        cvId={cvId}
        onExportPdf={handleExportPdf}
        isExporting={isExporting}
      />

      <div className="editor-body">
        {/* Panel trái: Section tabs + Form */}
        <aside className="editor-panel-left">
          <nav className="editor-section-tabs">
            {sections.map((s) => (
              <button
                key={s.id}
                className={`editor-tab${activeSection === s.id ? " active" : ""}`}
                onClick={() => {
                  setSection(s.id);
                  document
                    .getElementById(`section-${s.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </nav>

          <div className="editor-form-area">
            <SortableSectionList
              items={sectionOrder}
              onReorder={handleSectionReorder}
              renderItem={(id) => (
                <SortableItem key={id} id={id} showHandle={id !== "personal"}>
                  {renderSection(id)}
                </SortableItem>
              )}
            />
          </div>
        </aside>

        {/* Panel phải: Preview A4 */}
        <div className="editor-panel-right">
          <div className="editor-preview-wrapper">
            <CvPreview data={cvData} template={initialTemplate} />
          </div>
        </div>
      </div>
    </div>
  );
}
