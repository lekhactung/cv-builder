"use client"
import { TEMPLATES } from "@/lib/blocks/template"
import { useEditorStore } from "@/lib/stores/editorStore"
import { useSession } from "next-auth/react"

interface Props { onClose: () => void }

export default function TemplatePicker({ onClose }: Props) {
    const { updateDocument, setTemplateName, setTemplateId } = useEditorStore()
    const { data: session } = useSession()

    const allowedTemplates = session?.user?.allowedTemplates || ["single", "two-col"]
    const availableTemplates = TEMPLATES.filter(t => allowedTemplates.includes(t.id))

    const applyTemplate = (t: typeof TEMPLATES[0]) => {
        if (!confirm("Áp dụng template mới sẽ thay thế toàn bộ nội dung hiện tại. Tiếp tục?")) return
        updateDocument(() => t.create())
        setTemplateName(t.name)
        setTemplateId(t.id)
        onClose()
    }

    return (
        <div className="template-picker-overlay" onClick={onClose}>
            <div className="template-picker" onClick={(e) => e.stopPropagation()}>
                <h2 className="template-picker-title">Chọn Template</h2>
                <div className="template-picker-grid">
                    {availableTemplates.map((t) => (
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
