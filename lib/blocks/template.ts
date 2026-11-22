import { CvDocument } from "../schemas/block.schema";
import { createDefaultBlock } from "./default";
import { createFreeformText } from "../freeform";

export const singleColumnTemplate = (): CvDocument => ({
  layout: "single",
  theme: {
    primaryColor: "#7c3aed",
    accentColor: "#f43f5e",
    fontFamily: "Inter",
    fontSize: 14,
    lineHeight: 1.5,
  },
  columns: [
    {
      id: crypto.randomUUID(),
      width: 1,
      blocks: [
        createDefaultBlock("header"),
        createDefaultBlock("text"),
        createDefaultBlock("timeline"),
        createDefaultBlock("skills"),
      ],
    },
  ],
});

export const twoColumnTemplate = (): CvDocument => ({
  layout: "two-column",
  theme: {
    primaryColor: "#0f172a",
    accentColor: "#3b82f6",
    fontFamily: "Plus Jakarta Sans",
    fontSize: 13,
    lineHeight: 1.5,
  },
  columns: [
    {
      id: crypto.randomUUID(),
      width: 0.65,
      blocks: [
        createDefaultBlock("header"),
        createDefaultBlock("text"),
        { ...createDefaultBlock("timeline"), label: "Kinh nghiệm làm việc" },
        { ...createDefaultBlock("timeline"), label: "Học vấn" },
      ],
    },
    {
      id: crypto.randomUUID(),
      width: 0.35,
      blocks: [
        createDefaultBlock("tags"),
        createDefaultBlock("links"),
        createDefaultBlock("skills"),
      ],
    },
  ],
});

export const sidebarLeftTemplate = (): CvDocument => ({
  layout: "sidebar-left",
  theme: {
    primaryColor: "#059669",
    accentColor: "#f59e0b",
    fontFamily: "Inter",
    fontSize: 13,
    lineHeight: 1.6,
  },
  columns: [
    {
      id: crypto.randomUUID(),
      width: 0.33,
      blocks: [
        createDefaultBlock("header"),
        createDefaultBlock("skills"),
        createDefaultBlock("links"),
      ],
    },
    {
      id: crypto.randomUUID(),
      width: 0.67,
      blocks: [
        createDefaultBlock("text"),
        createDefaultBlock("timeline"),
        { ...createDefaultBlock("timeline"), label: "Học vấn" },
      ],
    },
  ],
});

export const harvardTemplate = (): CvDocument => ({
  layout: "harvard",
  theme: {
    primaryColor: "#000000",
    accentColor: "#333333",
    fontFamily: "Times New Roman, serif",
    fontSize: 13,
    lineHeight: 1.4,
  },
  columns: [
    {
      id: crypto.randomUUID(),
      width: 1,
      blocks: [
        createDefaultBlock("header"),
        { ...createDefaultBlock("text"), label: "Mục tiêu nghề nghiệp", icon: "" },
        { ...createDefaultBlock("timeline"), label: "Học vấn", icon: "" },
        { ...createDefaultBlock("timeline"), label: "Kinh nghiệm làm việc", icon: "" },
        { ...createDefaultBlock("skills"), icon: "" },
      ],
    },
  ],
});

export const freeformTemplate = (): CvDocument => ({
  layout: "freeform",
  theme: {
    primaryColor: "#4f46e5",
    accentColor: "#0f172a",
    fontFamily: "Inter",
    fontSize: 14,
    lineHeight: 1.5,
  },
  columns: [
    {
      id: crypto.randomUUID(),
      width: 1,
      blocks: [
        createFreeformText(
          "Họ và tên",
          "HỌ VÀ TÊN",
          { x: 48, y: 48, width: 698, height: 56 },
          { fontSize: 32, bold: true, color: "#0f172a" },
        ),
        createFreeformText(
          "Chức danh",
          "CHỨC DANH CỦA BẠN",
          { x: 48, y: 112, width: 698, height: 32 },
          { fontSize: 16, color: "#4f46e5" },
        ),
        createFreeformText(
          "Liên hệ",
          "email@example.com  ·  0900 000 000  ·  Hà Nội\nportfolio.example.com",
          { x: 48, y: 166, width: 698, height: 56 },
          { fontSize: 12, color: "#64748b" },
        ),
        createFreeformText(
          "Tiêu đề giới thiệu",
          "GIỚI THIỆU",
          { x: 48, y: 264, width: 200, height: 32 },
          { fontSize: 13, bold: true, color: "#4f46e5" },
        ),
        createFreeformText(
          "Giới thiệu",
          "Viết một đoạn ngắn giới thiệu về kinh nghiệm, thế mạnh và mục tiêu nghề nghiệp của bạn.",
          { x: 278, y: 264, width: 468, height: 112 },
        ),
        createFreeformText(
          "Tiêu đề kinh nghiệm",
          "KINH NGHIỆM",
          { x: 48, y: 424, width: 200, height: 32 },
          { fontSize: 13, bold: true, color: "#4f46e5" },
        ),
        createFreeformText(
          "Vị trí công việc",
          "Vị trí công việc",
          { x: 278, y: 424, width: 468, height: 32 },
          { fontSize: 17, bold: true, color: "#0f172a" },
        ),
        createFreeformText(
          "Công ty và thời gian",
          "Tên công ty  ·  2023 – Hiện tại",
          { x: 278, y: 464, width: 468, height: 32 },
          { fontSize: 12, color: "#64748b" },
        ),
        createFreeformText(
          "Mô tả công việc",
          "• Mô tả công việc và trách nhiệm chính.\n• Nêu thành tựu nổi bật cùng kết quả đo lường được.\n• Thêm kỹ năng và công cụ đã sử dụng.",
          { x: 278, y: 512, width: 468, height: 128 },
        ),
        createFreeformText(
          "Tiêu đề học vấn",
          "HỌC VẤN",
          { x: 48, y: 704, width: 200, height: 32 },
          { fontSize: 13, bold: true, color: "#4f46e5" },
        ),
        createFreeformText(
          "Học vấn",
          "Tên trường đại học\nChuyên ngành  ·  2019 – 2023\nThành tích học tập hoặc chứng chỉ nổi bật.",
          { x: 278, y: 704, width: 468, height: 112 },
        ),
        createFreeformText(
          "Tiêu đề kỹ năng",
          "KỸ NĂNG",
          { x: 48, y: 880, width: 200, height: 32 },
          { fontSize: 13, bold: true, color: "#4f46e5" },
        ),
        createFreeformText(
          "Kỹ năng",
          "Kỹ năng chuyên môn  ·  Công cụ làm việc\nNgoại ngữ  ·  Giao tiếp  ·  Làm việc nhóm",
          { x: 278, y: 880, width: 468, height: 96 },
        ),
      ],
    },
  ],
});

export const TEMPLATES = [
  {
    id: "single",
    name: "Đơn giản",
    description: "1 cột, layout sạch",
    create: singleColumnTemplate,
  },
  {
    id: "two-col",
    name: "Chuyên nghiệp",
    description: "2 cột, sidebar kỹ năng",
    create: twoColumnTemplate,
  },
  {
    id: "sidebar",
    name: "Sáng tạo",
    description: "Sidebar trái màu, nổi bật",
    create: sidebarLeftTemplate,
  },
  {
    id: "harvard",
    name: "Harvard",
    description: "Chuẩn học thuật, đen trắng",
    create: harvardTemplate,
  },
  {
    id: "freeform",
    name: "Tự do",
    description: "Tự kéo thả từng hộp chữ như Canva",
    create: freeformTemplate,
  },
];
