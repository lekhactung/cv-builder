import { TEMPLATES } from "./template";
import type { CvDocument } from "../schemas/block.schema";

// Gallery-only content; template.create() still produces an empty CV for editing.
export const TEMPLATE_PREVIEWS: Record<string, CvDocument> = Object.fromEntries(
  TEMPLATES.map((template) => {
    const doc = template.create();
    if (doc.layout === "freeform") {
      const name = doc.columns[0].blocks[0];
      if (name.type === "text") name.data.content = "NGUYỄN MINH ANH";
      return [template.id, doc];
    }
    doc.columns.forEach((column, columnIndex) => {
      column.id = `preview-column-${columnIndex}`;
      column.blocks.forEach((block, blockIndex) => {
        block.id = `${column.id}-block-${blockIndex}`;
        switch (block.type) {
          case "header":
            block.data = {
              fullName: "NGUYỄN MINH ANH",
              jobTitle: "Chuyên viên Marketing",
              email: "minhanh@example.com",
              phone: "090 123 4567",
              location: "Hà Nội, Việt Nam",
              website: "portfolio.example.com",
              linkedin: "",
              avatarUrl: "",
            };
            break;
          case "text":
            block.data.content =
              "Chuyên viên Marketing với 3 năm kinh nghiệm xây dựng nội dung và triển khai chiến dịch số. Mong muốn phát triển các chiến dịch sáng tạo, mang lại giá trị bền vững cho thương hiệu.";
            break;
          case "timeline": {
            const education = block.label === "Học vấn";
            block.data.items = [
              {
                id: `${block.id}-item`,
                title: education ? "Đại học Kinh tế Quốc dân" : "Chuyên viên Digital Marketing",
                subtitle: education
                  ? "Cử nhân Marketing · GPA: 3.6/4.0"
                  : "Công ty Truyền thông ABC",
                startDate: education ? "2019" : "2023",
                endDate: education ? "2023" : "",
                current: !education,
                description: education
                  ? "Tốt nghiệp loại Giỏi. Tham gia câu lạc bộ truyền thông và các dự án nghiên cứu thị trường."
                  : "Xây dựng kế hoạch nội dung cho website và mạng xã hội.\nTăng 35% lượt tiếp cận tự nhiên qua các chiến dịch nội dung.\nPhối hợp cùng đội ngũ thiết kế triển khai chiến dịch quảng cáo.",
              },
            ];
            break;
          }
          case "skills":
            block.data.items = [
              { id: `${block.id}-1`, name: "Content Marketing", level: 90 },
              { id: `${block.id}-2`, name: "Phân tích dữ liệu", level: 80 },
              { id: `${block.id}-3`, name: "Làm việc nhóm", level: 85 },
              { id: `${block.id}-4`, name: "Tiếng Anh", level: 75 },
            ];
            break;
          case "tags":
            block.data.tags = ["Google Analytics", "SEO", "Canva", "Excel"];
            break;
          case "links":
            block.data.items = [
              {
                id: `${block.id}-link`,
                label: "Portfolio",
                url: "portfolio.example.com",
                icon: "link",
              },
            ];
            break;
        }
      });
    });
    return [template.id, doc];
  }),
);
