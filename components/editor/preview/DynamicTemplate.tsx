import { CvDocument, Block } from "@/lib/schemas/block.schema";
import React from "react";

interface Props {
    doc: CvDocument
}

export default function DynamicTemplate({ doc }: Props) {
    const { columns, theme } = doc

    const cssVars = {
        "--cv-primary": theme.primaryColor,
        "--cv-accent": theme.accentColor,
        "--cv-font": theme.fontFamily,
        "--cv-font-size": `${theme.fontSize}px`,
        "--cv-line-height": theme.lineHeight,
    } as React.CSSProperties

    return (
        <div className="cv-dynamic" style={cssVars}>
            <div className={`cv-columns cv-layout-${doc.layout}`}>
                {columns.map((col) => (
                    <div
                        key={col.id}
                        className="cv-column"
                        style={{ flex: col.width }}
                    >
                        {col.blocks.filter((b) => b.visible).map((block) => (
                            <BlockRenderer key={block.id} block={block} theme={theme} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

function BlockRenderer({ block, theme }: { block: Block; theme: CvDocument["theme"] }) {
    switch (block.type) {
        case "header": return <HeaderRenderer data={block.data as any} theme={theme} />
        case "text": return <TextRenderer data={block.data as any} label={block.label} />
        case "timeline": return <TimelineRenderer data={block.data as any} label={block.label} icon={block.icon} />
        case "skills": return <SkillsRenderer data={block.data as any} label={block.label} icon={block.icon} />
        case "tags": return <TagsRenderer data={block.data as any} label={block.label} icon={block.icon} />
        case "links": return <LinksRenderer data={block.data as any} label={block.label} />
        case "divider": return <DividerRenderer data={block.data as any} />
        case "spacer": return <div style={{ height: (block.data as any).height ?? 16 }} />
        default: return null
    }
}

function HeaderRenderer({ data, theme }: any) {
    return (
        <div className="cv-header">
            {data.avatarUrl && <img src={data.avatarUrl} className="cv-avatar" alt="avatar" />}
            <div>
                <h1 className="cv-name">{data.fullName || "Họ và Tên"}</h1>
                <p className="cv-jobtitle">{data.jobTitle || "Chức danh"}</p>
                <div className="cv-contacts">
                    {data.email && <span> {data.email}</span>}
                    {data.phone && <span> {data.phone}</span>}
                    {data.location && <span> {data.location}</span>}
                    {data.website && <span>{data.website}</span>}
                    {data.linkedin && <span> {data.linkedin}</span>}
                </div>
            </div>
        </div>
    )
}
function SectionTitle({ label, icon }: { label: string; icon: string }) {
    return (
        <h2 className="cv-section-title">{icon && <span>{icon} </span>}{label}</h2>
    )
}
function TextRenderer({ data, label }: any) {
    if (!data.content) return null
    return (
        <div className="cv-section">
            {label && <SectionTitle label={label} icon="" />}
            <p className="cv-summary">{data.content}</p>
        </div>
    )
}
function TimelineRenderer({ data, label, icon }: any) {
    if (!data.items?.length) return null
    return (
        <div className="cv-section">
            <SectionTitle label={label} icon={icon} />
            {data.items.map((item: any) => (
                <div key={item.id} className="cv-item">
                    <div className="cv-item-header">
                        <div>
                            <p className="cv-item-title">{item.title}</p>
                            <p className="cv-item-subtitle">{item.subtitle}</p>
                        </div>
                        <p className="cv-item-date">
                            {item.startDate} — {item.current ? "Hiện tại" : item.endDate}
                        </p>
                    </div>
                    {item.description && (
                        <div className="cv-item-desc">
                            {item.description.split("\n").map((line: string, i: number) => <p key={i}>{line}</p>)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
function SkillsRenderer({ data, label, icon }: any) {
    if (!data.items?.length) return null
    return (
        <div className="cv-section">
            <SectionTitle label={label} icon={icon} />
            <div className="cv-skills-grid">
                {data.items.map((skill: any) => (
                    <div key={skill.id} className="cv-skill-item">
                        <div className="cv-skill-header">
                            <span className="cv-skill-name">{skill.name}</span>
                            <span className="cv-skill-level-label">{skill.level}%</span>
                        </div>
                        <div className="cv-skill-bar-track">
                            <div className="cv-skill-bar-fill" style={{ width: `${skill.level}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
function TagsRenderer({ data, label, icon }: any) {
    if (!data.tags?.length) return null
    return (
        <div className="cv-section">
            <SectionTitle label={label} icon={icon} />
            <div className="cv-tags">
                {data.tags.map((tag: string, i: number) => (
                    <span key={i} className="cv-tag">{tag}</span>
                ))}
            </div>
        </div>
    )
}
function LinksRenderer({ data, label }: any) {
    if (!data.items?.length) return null
    return (
        <div className="cv-section">
            {label && <SectionTitle label={label} icon="🔗" />}
            {data.items.map((link: any) => (
                <div key={link.id} className="cv-link-item">
                    <span>{link.label}: </span>
                    <span className="cv-link-url">{link.url}</span>
                </div>
            ))}
        </div>
    )
}
function DividerRenderer({ data }: any) {
    return <hr className="cv-divider" style={{ borderStyle: data.style }} />
} 