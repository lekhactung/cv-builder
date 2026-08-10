"use client"
import React, { useRef, useLayoutEffect, useCallback } from "react"
import { useEditorStore } from "@/lib/stores/editorStore"
import { Block, CvDocument } from "@/lib/schemas/block.schema"
import { Plus, X } from "lucide-react"
import AIEnhanceButton from "@/components/AIEnhanceButton"

// ── Tiny ID helper ────────────────────────────────────────────
const uid = () => crypto.randomUUID()

// ── Editable contenteditable element ─────────────────────────
function E({
    value,
    onSave,
    className = "",
    placeholder = "",
    multiline = false,
    style,
}: {
    value: string
    onSave: (v: string) => void
    className?: string
    placeholder?: string
    multiline?: boolean
    style?: React.CSSProperties
}) {
    const ref = useRef<HTMLElement>(null)
    const focused = useRef(false)

    useLayoutEffect(() => {
        if (!focused.current && ref.current) {
            const target = value ?? ""
            if (ref.current.innerText !== target) {
                ref.current.innerText = target
            }
        }
    }, [value])

    const Tag: any = multiline ? "div" : "span"
    return (
        <Tag
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            className={`cve ${className}`}
            data-ph={placeholder}
            style={style}
            onFocus={() => { focused.current = true }}
            onBlur={(e: any) => {
                focused.current = false
                const text = e.currentTarget.innerText.trim()
                if (text !== (value ?? "")) onSave(text)
            }}
            onKeyDown={(e: React.KeyboardEvent) => {
                if (!multiline && e.key === "Enter") {
                    e.preventDefault()
                        ; (e.target as HTMLElement).blur()
                }
                e.stopPropagation()
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
    )
}

function SectionTitle({ blockId, columnId, label, icon }: {
    blockId: string; columnId: string; label: string; icon?: string
}) {
    const { updateBlock } = useEditorStore()
    return (
        <h2 className="cv-section-title">
            <E
                value={label}
                onSave={(v) => updateBlock(columnId, blockId, (b) => ({ ...b, label: v }))}
                placeholder="Tên mục"
            />
        </h2>
    )
}

export default function EditableTemplate() {
    const { document, updateBlock, selectBlock, selectedBlockId } = useEditorStore()
    const { columns, theme } = document

    const cssVars = {
        "--cv-primary": theme.primaryColor,
        "--cv-accent": theme.accentColor,
        "--cv-font": theme.fontFamily,
        "--cv-font-size": `${theme.fontSize}px`,
        "--cv-line-height": theme.lineHeight,
    } as React.CSSProperties

    const patch = useCallback(
        (columnId: string, blockId: string, dataPatch: Record<string, unknown>) => {
            updateBlock(columnId, blockId, (b) => ({
                ...b,
                data: { ...(b.data as any), ...dataPatch },
            }))
        },
        [updateBlock]
    )

    return (
        <div className="cv-dynamic flex-1 flex flex-col" style={cssVars}>
            <div className={`cv-columns flex-1 cv-layout-${document.layout}`}>
                {columns.map((col) => (
                    <div key={col.id} className="cv-column" style={{ flex: col.width }}>
                        {col.blocks.filter((b) => b.visible).map((block) => (
                            <EditableBlockRenderer
                                key={block.id}
                                block={block}
                                columnId={col.id}
                                theme={theme}
                                isSelected={selectedBlockId === block.id}
                                onSelect={() => selectBlock(block.id, col.id)}
                                patch={(d) => patch(col.id, block.id, d)}
                                updateBlock={(updater) => updateBlock(col.id, block.id, updater)}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

interface BProps {
    block: Block
    columnId: string
    theme: CvDocument["theme"]
    isSelected: boolean
    onSelect: () => void
    patch: (d: Record<string, unknown>) => void
    updateBlock: (updater: (b: Block) => Block) => void
}

function EditableBlockRenderer({ block, columnId, theme, isSelected, onSelect, patch, updateBlock }: BProps) {
    const d = block.data as any
    const wrapCls = `cv-block-wrap group/block rounded-md transition-all border border-transparent ${isSelected ? "ring-2 ring-indigo-500/30 bg-indigo-50/10" : "hover:border-indigo-500/20 hover:bg-slate-50/50"}`

    const patchItem = (field: string, idx: number, val: unknown) => {
        const items = [...(d.items ?? [])]
        items[idx] = { ...items[idx], [field]: val }
        patch({ items })
    }

    const removeItem = (idx: number) => {
        const items = [...(d.items ?? [])]
        items.splice(idx, 1)
        patch({ items })
    }

    switch (block.type) {
        case "header":
            return (
                <div className={`cv-header ${wrapCls}`} onClick={onSelect}>
                    {d.avatarUrl && <img src={d.avatarUrl} className="cv-avatar" alt="avatar" />}
                    <div>
                        <E value={d.fullName} onSave={(v) => patch({ fullName: v })}
                            className="cv-name" placeholder="Họ và Tên" />
                        <div style={{ height: "3px" }} />
                        <E value={d.jobTitle} onSave={(v) => patch({ jobTitle: v })}
                            className="cv-jobtitle" placeholder="Chức danh" />
                        <div className="cv-contacts justify-center">
                            <E value={d.email} onSave={(v) => patch({ email: v })} placeholder="Email" />
                            <E value={d.phone} onSave={(v) => patch({ phone: v })} placeholder="Điện thoại" />
                            <E value={d.location} onSave={(v) => patch({ location: v })} placeholder="Địa điểm" />
                            <E value={d.website} onSave={(v) => patch({ website: v })} placeholder="Website" />
                        </div>
                    </div>
                </div>
            )

        case "text":
            return (
                <div className={`cv-section ${wrapCls}`} onClick={onSelect}>
                    {block.label && (
                        <SectionTitle blockId={block.id} columnId={columnId} label={block.label} />
                    )}
                    {/* Fix #5: xóa <E> thừa — giờ chỉ có 1 contenteditable cho content,
                        AI button được đặt ngay cạnh editor thực sự (cv-summary) */}
                    <div className="relative group/ai">
                        <E value={d.content} onSave={(v) => patch({ content: v })}
                            className="cv-summary" placeholder="Nhập nội dung..." multiline />
                        <div className="absolute right-2 top-2 opacity-0 group-hover/ai:opacity-100 transition-opacity print:hidden">
                            <AIEnhanceButton
                                currentText={d.content}
                                type="summary"
                                onAccept={(newText) => patch({ content: newText })}
                            />
                        </div>
                    </div>
                </div>
            )

        case "timeline":
            return (
                <div className={`cv-section ${wrapCls} text-center [&_.cv-section-title]:text-center`} onClick={onSelect}>
                    <SectionTitle blockId={block.id} columnId={columnId} label={block.label} icon={block.icon} />
                    {(d.items ?? []).map((item: any, idx: number) => (
                        <div key={item.id ?? idx} className="cv-item relative mt-4">
                            <div className="w-full relative text-center">
                                <E value={item.title} onSave={(v) => patchItem("title", idx, v)}
                                    className="cv-item-title" placeholder="Vị trí / Tên trường" />
                                <br />
                                <E value={item.subtitle} onSave={(v) => patchItem("subtitle", idx, v)}
                                    className="cv-item-subtitle" placeholder="Công ty / Ngành học" />
                                <div className="absolute right-0 top-0 flex items-center justify-end">
                                    <E value={item.startDate} onSave={(v) => patchItem("startDate", idx, v)}
                                        className="cv-item-date" placeholder="Từ" />
                                    <span className="cv-item-date px-1">—</span>
                                    <E value={item.current ? "Hiện tại" : item.endDate}
                                        onSave={(v) => patchItem("endDate", idx, v)}
                                        className="cv-item-date" placeholder="Đến" />
                                    <button className="print:hidden text-red-500 opacity-0 group-hover/block:opacity-100 hover:bg-red-50 p-1 rounded transition-all ml-1"
                                        onClick={(e) => { e.stopPropagation(); removeItem(idx) }}
                                        title="Xóa"><X size={14} /></button>
                                </div>
                            </div>
                             <div className="relative group/ai-desc">
                                <E value={item.description} onSave={(v) => patchItem("description", idx, v)}
                                    className="cv-item-desc cv-summary block text-center mt-2" placeholder="Mô tả công việc, kết quả..." multiline />
                                <div className="absolute right-0 top-1 opacity-0 group-hover/ai-desc:opacity-100 transition-opacity print:hidden">
                                    <AIEnhanceButton
                                        currentText={item.description ?? ""}
                                        type="experience"
                                        onAccept={(v) => patchItem("description", idx, v)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="print:hidden flex items-center gap-1 mt-2 text-xs font-medium text-indigo-600 opacity-0 group-hover/block:opacity-100 hover:bg-indigo-50 px-2 py-1 rounded transition-all w-fit" onClick={(e) => {
                        e.stopPropagation()
                        patch({
                            items: [...(d.items ?? []), {
                                id: uid(), title: "", subtitle: "",
                                startDate: "", endDate: "", current: false, description: "",
                            }]
                        })
                    }}>
                        <Plus size={14} /> Thêm mục
                    </button>
                </div>
            )

        case "skills":
            return (
                <div className={`cv-section ${wrapCls}`} onClick={onSelect}>
                    <SectionTitle blockId={block.id} columnId={columnId} label={block.label} icon={block.icon} />
                    <div className="cv-skills-grid">
                        {(d.items ?? []).map((skill: any, idx: number) => (
                            <div key={skill.id ?? idx} className="cv-skill-item">
                                <div className="cv-skill-header">
                                    <E value={skill.name} onSave={(v) => patchItem("name", idx, v)}
                                        className="cv-skill-name" placeholder="Kỹ năng" />
                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                        <span className="cv-skill-level-label">{skill.level}%</span>
                                        <button className="print:hidden text-red-500 opacity-0 group-hover/block:opacity-100 hover:bg-red-50 p-0.5 rounded transition-all"
                                            onClick={(e) => { e.stopPropagation(); removeItem(idx) }}><X size={14} /></button>
                                    </span>
                                </div>
                                <div className="cv-skill-bar-track">
                                    <div className="cv-skill-bar-fill" style={{ width: `${skill.level}%` }} />
                                </div>
                                <input type="range" min={0} max={100}
                                    value={skill.level}
                                    className="cv-skill-slider print:hidden"
                                    onChange={(e) => patchItem("level", idx, Number(e.target.value))}
                                    onClick={(e) => e.stopPropagation()} />
                            </div>
                        ))}
                    </div>
                    <button className="print:hidden flex items-center gap-1 mt-2 text-xs font-medium text-indigo-600 opacity-0 group-hover/block:opacity-100 hover:bg-indigo-50 px-2 py-1 rounded transition-all" onClick={(e) => {
                        e.stopPropagation()
                        patch({ items: [...(d.items ?? []), { id: uid(), name: "", level: 80 }] })
                    }}>
                        <Plus size={14} /> Thêm kỹ năng
                    </button>
                </div>
            )

        case "tags":
            return (
                <div className={`cv-section ${wrapCls}`} onClick={onSelect}>
                    <SectionTitle blockId={block.id} columnId={columnId} label={block.label} icon={block.icon} />
                    <div className="cv-tags">
                        {(d.tags ?? []).map((tag: string, idx: number) => (
                            <span key={idx} className="cv-tag cv-tag-editable">
                                <E value={tag} onSave={(v) => {
                                    const tags = [...(d.tags ?? [])]
                                    tags[idx] = v
                                    patch({ tags })
                                }} placeholder="Tag" />
                                <button className="print:hidden text-red-500 opacity-0 group-hover/block:opacity-100 hover:bg-red-50 p-0.5 rounded transition-all ml-1" onClick={(e) => {
                                    e.stopPropagation()
                                    const tags = [...(d.tags ?? [])]
                                    tags.splice(idx, 1)
                                    patch({ tags })
                                }}><X size={12} /></button>
                            </span>
                        ))}
                        <button className="print:hidden flex items-center justify-center w-6 h-6 rounded-full text-indigo-600 border border-dashed border-indigo-300 opacity-0 group-hover/block:opacity-100 hover:bg-indigo-50 transition-all" onClick={(e) => {
                            e.stopPropagation()
                            patch({ tags: [...(d.tags ?? []), "Kỹ năng mới"] })
                        }}><Plus size={14} /></button>
                    </div>
                </div>
            )

        case "links":
            return (
                <div className={`cv-section ${wrapCls}`} onClick={onSelect}>
                    {block.label && (
                        <SectionTitle blockId={block.id} columnId={columnId} label={block.label} />
                    )}
                    {(d.items ?? []).map((link: any, idx: number) => (
                        <div key={link.id ?? idx} className="cv-link-item" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <E value={link.label} onSave={(v) => patchItem("label", idx, v)} placeholder="Nhãn" />
                            <span>: </span>
                            <E value={link.url} onSave={(v) => patchItem("url", idx, v)}
                                className="cv-link-url" placeholder="URL" />
                            <button className="print:hidden text-red-500 opacity-0 group-hover/block:opacity-100 hover:bg-red-50 p-0.5 rounded transition-all ml-1"
                                onClick={(e) => { e.stopPropagation(); removeItem(idx) }}><X size={14} /></button>
                        </div>
                    ))}
                    <button className="print:hidden flex items-center gap-1 mt-2 text-xs font-medium text-indigo-600 opacity-0 group-hover/block:opacity-100 hover:bg-indigo-50 px-2 py-1 rounded transition-all" onClick={(e) => {
                        e.stopPropagation()
                        patch({ items: [...(d.items ?? []), { id: uid(), label: "", url: "" }] })
                    }}>
                        <Plus size={14} /> Thêm link
                    </button>
                </div>
            )

        case "divider":
            return <hr className="cv-divider" style={{ borderStyle: d.style }} />
        case "spacer":
            return <div style={{ height: d.height ?? 16 }} />
        default:
            return null
    }
}
