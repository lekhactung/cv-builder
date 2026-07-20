// components/editor/preview/ModernTemplatePdf.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { CvData } from "@/lib/schemas/cv.schema";

const LEVEL_MAP: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 95,
};

// Đăng ký font hỗ trợ tiếng Việt — file local trong public/fonts/
Font.register({
  family: "Mulish",
  fonts: [
    {
      src: "/fonts/Mulish-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/Mulish-Bold.ttf",
      fontWeight: 700,
    },
  ],
});

const s = StyleSheet.create({
  page: {
    fontFamily: "Mulish",
    fontSize: 10,
    color: "#1e1e2e",
    padding: "34 45",
    backgroundColor: "#ffffff",
  },
  // Header
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#6366f1",
    paddingBottom: 22,
    marginBottom: 17,
  },
  name: {
    fontSize: 22,
    fontFamily: "Mulish",
    fontWeight: 700,
    color: "#1e1e2e",
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 11,
    fontFamily: "Mulish",
    fontWeight: 700,
    color: "#6366f1",
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  contactText: {
    fontSize: 8.5,
    color: "#555555",
  },
  // Section
  section: {
    marginBottom: 17,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Mulish",
    fontWeight: 700,
    color: "#6366f1",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0f0",
    paddingBottom: 6,
    marginBottom: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  summary: {
    fontSize: 9.5,
    lineHeight: 1.6,
    color: "#444444",
  },
  // Experience / Education item
  item: {
    marginBottom: 11,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 10,
    fontFamily: "Mulish",
    fontWeight: 700,
    color: "#1e1e2e",
  },
  itemSubtitle: {
    fontSize: 9,
    color: "#6366f1",
  },
  itemDate: {
    fontSize: 8.5,
    color: "#888888",
  },
  itemDesc: {
    marginTop: 6,
    paddingLeft: 8,
  },
  itemDescLine: {
    fontSize: 9,
    color: "#444444",
    lineHeight: 1.5,
    marginBottom: 3,
  },
  itemGpa: {
    fontSize: 8.5,
    color: "#777777",
    marginTop: 3,
  },
  // Skills
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillItem: {
    width: "47%",
    marginBottom: 6,
  },
  skillHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  skillName: {
    fontSize: 9,
    fontFamily: "Mulish",
    fontWeight: 700,
    color: "#1e1e2e",
  },
  skillLevel: {
    fontSize: 8,
    color: "#888888",
  },
  skillTrack: {
    height: 4,
    backgroundColor: "#eeeeee",
    borderRadius: 2,
  },
  skillFill: {
    height: 4,
    backgroundColor: "#6366f1",
    borderRadius: 2,
  },
});

// ─── Component ─────────────────────────────────────────────────────────────
interface Props {
  data: CvData;
  sectionOrder?: string[];
}

const DEFAULT_ORDER = ["personal", "experience", "education", "skills"];

export default function ModernTemplatePdf({ data, sectionOrder = DEFAULT_ORDER }: Props) {
  const { personal, experience, education, skills } = data;

  // ── Render từng section ──────────────────────────────────────────────────
  const renderSummary = () =>
    personal.summary ? (
      <View key="personal" style={s.section}>
        <Text style={s.sectionTitle}>Giới thiệu</Text>
        <Text style={s.summary}>{personal.summary}</Text>
      </View>
    ) : null;

  const renderExperience = () =>
    experience.length > 0 ? (
      <View key="experience" style={s.section}>
        <Text style={s.sectionTitle}>Kinh nghiệm làm việc</Text>
        {experience.map((exp) => (
          <View key={exp.id} style={s.item}>
            <View style={s.itemHeader}>
              <View>
                <Text style={s.itemTitle}>{exp.position || "Vị trí"}</Text>
                <Text style={s.itemSubtitle}>{exp.company}</Text>
              </View>
              <Text style={s.itemDate}>
                {exp.startDate} - {exp.current ? "Hiện tại" : exp.endDate}
              </Text>
            </View>
            {exp.description && (
              <View style={s.itemDesc}>
                {exp.description.split("\n").map((line, i) => (
                  <Text key={i} style={s.itemDescLine}>{line}</Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    ) : null;

  const renderEducation = () =>
    education.length > 0 ? (
      <View key="education" style={s.section}>
        <Text style={s.sectionTitle}>Học vấn</Text>
        {education.map((edu) => (
          <View key={edu.id} style={s.item}>
            <View style={s.itemHeader}>
              <View>
                <Text style={s.itemTitle}>{edu.school}</Text>
                <Text style={s.itemSubtitle}>{edu.degree} — {edu.field}</Text>
                {edu.gpa && <Text style={s.itemGpa}>GPA: {edu.gpa}</Text>}
              </View>
              <Text style={s.itemDate}>{edu.startDate} — {edu.endDate}</Text>
            </View>
          </View>
        ))}
      </View>
    ) : null;

  const renderSkills = () =>
    skills.length > 0 ? (
      <View key="skills" style={s.section}>
        <Text style={s.sectionTitle}>Kỹ năng</Text>
        <View style={s.skillsGrid}>
          {skills.map((skill) => (
            <View key={skill.id} style={s.skillItem}>
              <View style={s.skillHeader}>
                <Text style={s.skillName}>{skill.name}</Text>
                <Text style={s.skillLevel}>{skill.level}</Text>
              </View>
              <View style={s.skillTrack}>
                <View style={[s.skillFill, { width: `${LEVEL_MAP[skill.level] ?? 50}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </View>
    ) : null;

  // Map section id → render function
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    personal: renderSummary,
    experience: renderExperience,
    education: renderEducation,
    skills: renderSkills,
  };

  return (
    <Document title={personal.fullName || "CV"} author={personal.fullName}>
      <Page size="A4" style={s.page}>
        {/* ── Header (luôn cố định ở trên) ── */}
        <View style={s.header}>
          <Text style={s.name}>{personal.fullName || "Họ và Tên"}</Text>
          <Text style={s.jobTitle}>{personal.jobTitle || "Chức danh"}</Text>
          <View style={s.contactRow}>
            {personal.email    && <Text style={s.contactText}>Email: {personal.email}</Text>}
            {personal.phone    && <Text style={s.contactText}>Điện thoại: {personal.phone}</Text>}
            {personal.location && <Text style={s.contactText}>Địa chỉ: {personal.location}</Text>}
            {personal.website  && <Text style={s.contactText}>Website: {personal.website}</Text>}
            {personal.linkedin && <Text style={s.contactText}>LinkedIn: {personal.linkedin}</Text>}
          </View>
        </View>

        {/* ── Các section theo thứ tự người dùng kéo thả ── */}
        {sectionOrder.map((id) => sectionRenderers[id]?.())}
      </Page>
    </Document>
  );
}
