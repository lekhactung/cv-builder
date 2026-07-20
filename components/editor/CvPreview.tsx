import { CvData } from "@/lib/schemas/cv.schema";
import ModernTemplate from "./preview/ModernTemplate";

interface Props { data: CvData; template: string; }

export default function CvPreview({ data, template }: Props) {
  const sectionOrder = data.sectionOrder ?? ["personal", "experience", "education", "skills"];

  return (
    <div className="cv-preview-scaler">
      {template === "Modern" && <ModernTemplate data={data} sectionOrder={sectionOrder} />}
    </div>
  );
}
