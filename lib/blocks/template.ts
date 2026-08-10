import { CvDocument } from "../schemas/block.schema";
import { createDefaultBlock } from "./default";

export const singleColumnTemplate = (): CvDocument => ({
  layout: "single",
  theme: { primaryColor: "#7c3aed", accentColor: "#f43f5e", fontFamily: "Inter", fontSize: 14, lineHeight: 1.5 },
  columns: [{
    id: crypto.randomUUID(),
    width: 1,
    blocks: [
      createDefaultBlock("header"),
      createDefaultBlock("text"),
      createDefaultBlock("timeline"),
      createDefaultBlock("skills"),
    ],
  }],
})

export const twoColumnTemplate = (): CvDocument => ({
  layout: "two-column",
  theme: { primaryColor: "#0f172a", accentColor: "#3b82f6", fontFamily: "Plus Jakarta Sans", fontSize: 13, lineHeight: 1.5 },
  columns: [
    {
      id: crypto.randomUUID(),
      width: 0.65,
      blocks: [
        createDefaultBlock("header"),
        createDefaultBlock("text"),
        { ...createDefaultBlock("timeline"), label: "Kinh nghiệm làm việc",},
        { ...createDefaultBlock("timeline"), label: "Học vấn", },
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
})

export const sidebarLeftTemplate = (): CvDocument => ({
  layout: "sidebar-left",
  theme: { primaryColor: "#059669", accentColor: "#f59e0b", fontFamily: "Inter", fontSize: 13, lineHeight: 1.6 },
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
        { ...createDefaultBlock("timeline"), label: "Học vấn", },
      ],
    },
  ],
})

export const harvardTemplate = (): CvDocument => ({
  layout: "harvard",
  theme: { primaryColor: "#000000", accentColor: "#333333", fontFamily: "Times New Roman, serif", fontSize: 13, lineHeight: 1.4 },
  columns: [{
    id: crypto.randomUUID(),
    width: 1,
    blocks: [
      createDefaultBlock("header"),
      { ...createDefaultBlock("text"), label: "Mục tiêu nghề nghiệp", icon: "" },
      { ...createDefaultBlock("timeline"), label: "Học vấn", icon: "" },
      { ...createDefaultBlock("timeline"), label: "Kinh nghiệm làm việc", icon: "" },
      { ...createDefaultBlock("skills"), icon: "" },
    ],
  }],
})

export const TEMPLATES = [
  { id: "single", name: "Đơn giản", description: "1 cột, layout sạch", create: singleColumnTemplate },
  { id: "two-col", name: "Chuyên nghiệp", description: "2 cột, sidebar kỹ năng", create: twoColumnTemplate },
  { id: "sidebar", name: "Sáng tạo", description: "Sidebar trái màu, nổi bật", create: sidebarLeftTemplate },
  { id: "harvard", name: "Harvard", description: "Chuẩn học thuật, đen trắng", create: harvardTemplate },
]