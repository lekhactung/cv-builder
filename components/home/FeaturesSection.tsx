import { Target, FileEdit, Sparkles, Search, Palette, FileText, DownloadCloud } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="features-section" id="features">
      <div className="container">
        <div className="section-header">
          <div className="section-badge">Tính năng</div>
          <h2 className="section-title">
            Tất cả công cụ bạn cần để{" "}
            <span className="gradient-text">chinh phục nhà tuyển dụng</span>
          </h2>
          <p className="section-subtitle">Từ tạo CV đến tối ưu hóa AI — chúng tôi có tất cả</p>
        </div>

        <div className="features-grid">
          {/* ATS Score Engine — large card */}
          <div className="feature-card feature-card-lg" id="feature-ats">
            <div className="feature-icon-wrap">
              <div className="feature-icon">
                <Target size={28} className="text-primary" />
              </div>
            </div>
            <h3>ATS Score Engine</h3>
            <p>
              Phân tích CV theo tiêu chí ATS thực tế. Điểm 0–100 với breakdown chi tiết: Keywords, Format, Content,
              Impact.
            </p>
            <div className="feature-demo-ats">
              {[
                { label: "Keywords", val: 82, color: "#6366F1" },
                { label: "Format",   val: 91, color: "#22D3EE" },
                { label: "Content",  val: 74, color: "#10B981" },
                { label: "Impact",   val: 88, color: "#F59E0B" },
              ].map(({ label, val, color }) => (
                <div className="ats-bar-item" key={label}>
                  <span>{label}</span>
                  <div className="ats-bar">
                    <div
                      className="ats-fill"
                      style={{ width: `${val}%`, "--color": color } as React.CSSProperties}
                    ></div>
                  </div>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Rewrite */}
          <div className="feature-card" id="feature-rewrite">
            <div className="feature-icon">
              <FileEdit size={28} className="text-primary" />
            </div>
            <h3>AI Rewrite</h3>
            <p>Biến bullet points nhàm chán thành câu mạnh mẽ với action verbs và số liệu cụ thể.</p>
            <div className="rewrite-demo">
              <div className="rewrite-before">
                <span className="rewrite-label">Trước</span>
                <p>&quot;Làm việc trong team&quot;</p>
              </div>
              <div className="rewrite-arrow">→</div>
              <div className="rewrite-after">
                <span className="rewrite-label rewrite-label-after">
                  Sau AI <Sparkles size={14} className="inline-block ml-1" />
                </span>
                <p>&quot;Led cross-functional team of 8, delivering 3 products on time&quot;</p>
              </div>
            </div>
          </div>

          {/* Job Match */}
          {/* <div className="feature-card" id="feature-match">
            <div className="feature-icon">
              <Search size={28} className="text-primary" />
            </div>
            <h3>Job Match Score</h3>
            <p>Paste JD vào — AI so khớp CV của bạn và chỉ ra gaps cần bổ sung để tăng cơ hội.</p>
            <div className="match-demo">
              <div className="match-score-ring">
                <span className="match-pct">73%</span>
                <span className="match-label">Phù hợp</span>
              </div>
              <div className="match-tags">
                <span className="tag-missing">Missing: Docker</span>
                <span className="tag-missing">Missing: K8s</span>
                <span className="tag-ok">✓ React</span>
                <span className="tag-ok">✓ Node.js</span>
              </div>
            </div>
          </div> */}

          {/* Templates */}
          {/* <div className="feature-card" id="feature-template">
            <div className="feature-icon">
              <Palette size={28} className="text-primary" />
            </div>
            <h3>20+ Templates</h3>
            <p>Từ ATS Classic đến Creative — đa dạng template phù hợp mọi ngành nghề và phong cách.</p>
            <div className="template-mini-grid">
              <div className="template-mini ats"></div>
              <div className="template-mini modern"></div>
              <div className="template-mini creative"></div>
              <div className="template-mini minimal"></div>
            </div>
          </div> */}

          {/* Cover Letter */}
          <div className="feature-card" id="feature-cover">
            <div className="feature-icon">
              <FileText size={28} className="text-primary" />
            </div>
            <h3>Cover Letter AI</h3>
            <p>Tự động tạo cover letter cá nhân hóa từ CV + JD của bạn trong vài giây.</p>
          </div>

          {/* Export */}
          {/* <div className="feature-card" id="feature-export">
            <div className="feature-icon">
              <DownloadCloud size={28} className="text-primary" />
            </div>
            <h3>Export đa định dạng</h3>
            <p>PDF pixel-perfect, DOCX, shareable link, QR Code và embed cho website cá nhân.</p>
          </div> */}
        </div>
      </div>
    </section>
  );
}
