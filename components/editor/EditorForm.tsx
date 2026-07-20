import { CvData } from "@/lib/schemas/cv.schema";
import PersonalSection   from "./sections/PersonalSection";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection  from "./sections/EducationSection";
import SkillsSection     from "./sections/SkillsSection";

type Section = "personal" | "experience" | "education" | "skills";

interface Props {
  section:  Section;
  cvData:   CvData;
  onUpdate: (updater: (prev: CvData) => CvData) => void;
}

export default function EditorForm({ section, cvData, onUpdate }: Props) {
  switch (section) {
    case "personal":
      return (
        <PersonalSection
          data={cvData.personal}
          onChange={(personal) => onUpdate((prev) => ({ ...prev, personal }))}
        />
      );
    case "experience":
      return (
        <ExperienceSection
          items={cvData.experience}
          onChange={(experience) => onUpdate((prev) => ({ ...prev, experience }))}
        />
      );
    case "education":
      return (
        <EducationSection
          items={cvData.education}
          onChange={(education) => onUpdate((prev) => ({ ...prev, education }))}
        />
      );
    case "skills":
      return (
        <SkillsSection
          items={cvData.skills}
          onChange={(skills) => onUpdate((prev) => ({ ...prev, skills }))}
        />
      );
  }
}
