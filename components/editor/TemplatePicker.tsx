"use client"
import { TEMPLATES } from "@/lib/blocks/template"
import { useEditorStore } from "@/lib/stores/editorStore"

interface Props { onClose: () => void }

export default function TemplatePicker({ onClose }: Props) {
    const { updateDocument, setTemplateName } = useEditorStore()

    const applyTemplate = (t: typeof TEMPLATES[0]) => {
        if (!confirm("Áp dụng template mới sẽ thay thế toàn bộ nội dung hiện tại. Tiếp tục?")) return
        updateDocument(() => t.create())
        setTemplateName(t.name)
        onClose()
    }

    return (
        <div className="template-picker-overlay" onClick={onClose}>
            <div className="template-picker" onClick={(e) => e.stopPropagation()}>
                <h2 className="template-picker-title">Chọn Template</h2>
                <div className="template-picker-grid">
                    {TEMPLATES.map((t) => (
                        <button key={t.id} className="template-card" onClick={() => applyTemplate(t)}>
                            <div className="template-thumbnail">
                                <div className="template-thumb-lines">
                                    <div />
                                    <div style={{ width: "70%" }} />
                                    <div style={{ width: "50%" }} />
                                    <div />
                                    <div style={{ width: "80%" }} />
                                </div>
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
    )
}
