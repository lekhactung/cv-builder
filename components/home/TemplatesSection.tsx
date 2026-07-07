"use client";

import { useState } from "react";

const filters = [
  { key: "all",      label: "Tất cả" },
  { key: "ats",      label: "ATS-Optimized" },
  { key: "creative", label: "Creative" },
  { key: "minimal",  label: "Minimal" },
  { key: "exec",     label: "Executive" },
];

const templates = [
  { id: 1, name: "ATS Classic",    category: "ats",      accent: "#6366F1" },
  { id: 2, name: "Modern Clean",   category: "minimal",  accent: "#22D3EE" },
  { id: 3, name: "Creative Pro",   category: "creative", accent: "#10B981" },
  { id: 4, name: "Executive Bold", category: "exec",     accent: "#F59E0B" },
  { id: 5, name: "Tech Resume",    category: "ats",      accent: "#8B5CF6" },
  { id: 6, name: "Minimal Slate",  category: "minimal",  accent: "#6366F1" },
];

export default function TemplatesSection() {
  const [active, setActive] = useState("all");

  const filtered = active === "all"
    ? templates
    : templates.filter((t) => t.category === active);

  return (
    <section className="templates-section" id="templates">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Templates</div>
          <h2 className="section-title">
            Templates <span className="gradient-text">được thiết kế bởi HR</span>
          </h2>
          <p className="section-subtitle">Mọi template đều được kiểm tra ATS-friendly</p>
        </div>

        <div className="template-filters">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`filter-btn${active === f.key ? " active" : ""}`}
              data-filter={f.key}
              onClick={() => setActive(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="template-gallery" id="template-gallery">
          {filtered.map((tpl) => (
            <div key={tpl.id} className="template-card">
              <div className="template-preview" style={{ "--accent": tpl.accent } as React.CSSProperties}>
                <div className="tpl-header-bar" style={{ background: tpl.accent }}></div>
                <div className="tpl-lines">
                  <div className="tpl-line tpl-line-lg"></div>
                  <div className="tpl-line tpl-line-sm"></div>
                  <div className="tpl-line tpl-line-md"></div>
                  <div className="tpl-line tpl-line-sm"></div>
                  <div className="tpl-line tpl-line-lg"></div>
                  <div className="tpl-line tpl-line-md"></div>
                </div>
              </div>
              <div className="template-card-footer">
                <span className="template-card-name">{tpl.name}</span>
                <button className="btn btn-outline btn-sm">Dùng ngay</button>
              </div>
            </div>
          ))}
        </div>

        <div className="templates-cta">
          <a href="/templates" className="btn btn-outline" id="view-all-templates">
            Xem tất cả 20+ templates →
          </a>
        </div>
      </div>
    </section>
  );
}
