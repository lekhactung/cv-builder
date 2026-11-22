"use client";
import { TEMPLATES } from "@/lib/blocks/template";
import { useEditorStore } from "@/lib/stores/editorStore";
import { useSession } from "next-auth/react";
import CvThumbnail from "@/components/CvThumbnail";
import { TEMPLATE_PREVIEWS } from "@/lib/blocks/template-preview";

interface Props {
  onClose: () => void;
}

export default function TemplatePicker({ onClose }: Props) {
  const { updateDocument, setTemplateName, setTemplateId } = useEditorStore();
  const { data: session } = useSession();

  const allowedTemplates = session?.user?.allowedTemplates || ["single", "two-col"];
  const availableTemplates = TEMPLATES.filter(
    (t) => t.id === "freeform" || allowedTemplates.includes(t.id),
  );

  const applyTemplate = (t: (typeof TEMPLATES)[0]) => {
    if (!confirm("Áp dụng template mới sẽ thay thế toàn bộ nội dung hiện tại. Tiếp tục?")) return;
    updateDocument(() => t.create());
    setTemplateName(t.name);
    setTemplateId(t.id);
    onClose();
  };

  return (
    <div className="template-picker-overlay" onClick={onClose}>
      <div className="template-picker" onClick={(e) => e.stopPropagation()}>
        <h2 className="template-picker-title">Chọn Template</h2>
        <div className="template-picker-grid">
          {availableTemplates.map((t) => (
            <button key={t.id} className="template-card" onClick={() => applyTemplate(t)}>
              <div className="template-thumbnail">
                <CvThumbnail data={TEMPLATE_PREVIEWS[t.id]} label={`Xem trước mẫu ${t.name}`} />
              </div>
              <div className="template-info">
                <p className="template-name">{t.name}</p>
                <p className="template-desc">{t.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
