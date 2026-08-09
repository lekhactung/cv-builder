"use client"
import { useState } from "react"
import { z } from "zod"
import { TagsBlockData } from "@/lib/schemas/block.schema"

type TagsData = z.infer<typeof TagsBlockData>

interface Props {
    data: TagsData
    onChange: (d: TagsData) => void
}

export default function TagsBlockSettings({ data, onChange }: Props) {
    const tags = data.tags ?? []

    const [inputVal, setInputVal] = useState("")
    const addTag = () => {
        const trimmed = inputVal.trim()
        if (!trimmed || tags.includes(trimmed)) return
        onChange({ tags: [...tags, trimmed] })
        setInputVal("")
    }

    const removeTag = (tag: string) =>
        onChange({ tags: tags.filter((t) => t !== tag) })

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            addTag()
        }
        if (e.key === "Backspace" && inputVal === "" && tags.length > 0) {
            onChange({ tags: tags.slice(0, -1) })
        }
    }
    return (
        <div className="editor-section-form">
            <h3 className="form-section-title">Tags / Nhãn</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", minHeight: "2rem" }}>
                {tags.map((tag) => (
                    <span
                        key={tag}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "0.25rem",
                            padding: "0.25rem 0.625rem",
                            background: "var(--primary-dim)", color: "var(--primary)",
                            border: "1px solid var(--border-hover)",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.8125rem", fontWeight: 500,
                        }}
                    >
                        {tag}
                        <button
                            onClick={() => removeTag(tag)}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                color: "inherit", fontSize: "0.875rem", lineHeight: 1,
                                padding: "0 2px", opacity: 0.7,
                            }}
                        >×</button>
                    </span>
                ))}
                {tags.length === 0 && (
                    <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        Chưa có tag nào...
                    </span>
                )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                    className="form-input"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tag rồi Enter (vd: JavaScript, Remote...)"
                    style={{ flex: 1 }}
                />
                <button
                    className="btn btn-outline btn-sm"
                    onClick={addTag}
                    disabled={!inputVal.trim()}
                >
                    Thêm
                </button>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "-0.25rem" }}>
                Nhấn <kbd style={{ background: "var(--bg-surface2)", padding: "1px 5px", borderRadius: 3 }}>Enter</kbd> để thêm,{" "}
                <kbd style={{ background: "var(--bg-surface2)", padding: "1px 5px", borderRadius: 3 }}>Backspace</kbd> khi rỗng để xóa tag cuối.
            </p>
        </div>

    )
}