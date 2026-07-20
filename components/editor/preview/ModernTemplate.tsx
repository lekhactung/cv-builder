import { CvData } from "@/lib/schemas/cv.schema";

const LEVEL_MAP: Record<string, number> = {
  beginner: 25, intermediate: 50, advanced: 75, expert: 95,
};

const DEFAULT_ORDER = ["personal", "experience", "education", "skills"];

interface Props {
  data: CvData;
  sectionOrder?: string[];
}

export default function ModernTemplate({ data, sectionOrder = DEFAULT_ORDER }: Props) {
  const { personal, experience, education, skills } = data;

  const renderSummary = () =>
    personal.summary ? (
      <div key="personal" className="cv-section">
        <h2 className="cv-section-title">Giới thiệu</h2>
        <p className="cv-summary">{personal.summary}</p>
      </div>
    ) : null;

  const renderExperience = () =>
    experience.length > 0 ? (
      <div key="experience" className="cv-section">
        <h2 className="cv-section-title">Kinh nghiệm làm việc</h2>
        {experience.map((exp) => (
          <div key={exp.id} className="cv-item">
            <div className="cv-item-header">
              <div>
                <p className="cv-item-title">{exp.position || "Vị trí"}</p>
                <p className="cv-item-subtitle">{exp.company}</p>
              </div>
              <p className="cv-item-date">
                {exp.startDate} - {exp.current ? "Hiện tại" : exp.endDate}
              </p>
            </div>
            {exp.description && (
              <div className="cv-item-desc">
                {exp.description.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null;

  const renderEducation = () =>
    education.length > 0 ? (
      <div key="education" className="cv-section">
        <h2 className="cv-section-title">Học vấn</h2>
        {education.map((edu) => (
          <div key={edu.id} className="cv-item">
            <div className="cv-item-header">
              <div>
                <p className="cv-item-title">{edu.school}</p>
                <p className="cv-item-subtitle">{edu.degree} — {edu.field}</p>
                {edu.gpa && <p className="cv-item-gpa">GPA: {edu.gpa}</p>}
              </div>
              <p className="cv-item-date">{edu.startDate} — {edu.endDate}</p>
            </div>
          </div>
        ))}
      </div>
    ) : null;

  const renderSkills = () =>
    skills.length > 0 ? (
      <div key="skills" className="cv-section">
        <h2 className="cv-section-title">Kỹ năng</h2>
        <div className="cv-skills-grid">
          {skills.map((skill) => (
            <div key={skill.id} className="cv-skill-item">
              <div className="cv-skill-header">
                <span className="cv-skill-name">{skill.name}</span>
                <span className="cv-skill-level-label">{skill.level}</span>
              </div>
              <div className="cv-skill-bar-track">
                <div
                  className="cv-skill-bar-fill"
                  style={{ width: `${LEVEL_MAP[skill.level] ?? 50}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  // Map section id → render function
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    personal: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
  };

  return (
    <div className="cv-modern">
      {/* Header — luôn cố định ở trên */}
      <div className="cv-header">
        <div className="cv-header-info">
          <h1 className="cv-name">{personal.fullName || "Họ và Tên"}</h1>
          <p className="cv-jobtitle">{personal.jobTitle || "Chức danh"}</p>
          <div className="cv-contacts">
            {personal.email    && <span>✉ {personal.email}</span>}
            {personal.phone    && <span>📞 {personal.phone}</span>}
            {personal.location && <span>📍 {personal.location}</span>}
            {personal.website  && <span>🔗 {personal.website}</span>}
            {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
          </div>
        </div>
      </div>

      {/* Các section theo thứ tự người dùng kéo thả */}
      {sectionOrder.map((id) => sectionRenderers[id]?.())}
    </div>
  );
}

