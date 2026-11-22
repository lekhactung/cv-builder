"use client";

import { useState } from "react";
import Link from "next/link";
import CvThumbnail from "@/components/CvThumbnail";
import { TEMPLATES } from "@/lib/blocks/template";
import { TEMPLATE_PREVIEWS } from "@/lib/blocks/template-preview";

const filters = [
  { key: "all", label: "Tất cả" },
  { key: "ats", label: "ATS-Optimized" },
  { key: "creative", label: "Creative" },
  { key: "minimal", label: "Minimal" },
  { key: "exec", label: "Executive" },
];

const categories: Record<string, string[]> = {
  single: ["ats", "minimal"],
  "two-col": ["ats"],
  sidebar: ["creative"],
  harvard: ["ats", "exec"],
  freeform: ["creative"],
};

export default function TemplatesSection() {
  const [active, setActive] = useState("all");
  const filtered = TEMPLATES.filter((t) => active === "all" || categories[t.id]?.includes(active));

  return (
    <section className="templates-section" id="templates">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Templates</div>
          <h2 className="section-title">
            Templates <span className="gradient-text">được thiết kế bởi HR</span>
          </h2>
          <p className="section-subtitle">Chọn bố cục có sẵn hoặc tự thiết kế CV với mẫu Tự do.</p>
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
              <Link
                href={`/editor/new?template=${tpl.id}`}
                className="template-preview"
                aria-label={`Dùng mẫu ${tpl.name}`}
              >
                <CvThumbnail data={TEMPLATE_PREVIEWS[tpl.id]} label={`Xem trước mẫu ${tpl.name}`} />
              </Link>
              <div className="template-card-footer">
                <span className="template-card-name">{tpl.name}</span>
                <Link className="btn btn-outline btn-sm" href={`/editor/new?template=${tpl.id}`}>
                  Dùng ngay
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="templates-cta">
          <button
            onClick={() => setActive("all")}
            className="btn btn-outline"
            id="view-all-templates"
          >
            Xem tất cả {TEMPLATES.length} templates →
          </button>
        </div>
      </div>
    </section>
  );
}
