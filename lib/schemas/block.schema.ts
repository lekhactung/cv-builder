import {z} from "zod"

export const BlockType = z.enum([
    "header",
    "text",
    "timeline",
    "skills",
    "tags",
    "links",
    "divider",
    "spacer",
])

export type BlockType = z.infer<typeof BlockType>

export const HeaderBlockData = z.object({
  fullName:  z.string().default(""),
  jobTitle:  z.string().default(""),
  email:     z.string().default(""),
  phone:     z.string().default(""),
  location:  z.string().default(""),
  website:   z.string().default(""),
  linkedin:  z.string().default(""),
  avatarUrl: z.string().default(""),
})
export const TextBlockData = z.object({
  content: z.string().default(""),
})
export const TimelineItemSchema = z.object({
  id:          z.string().default(() => crypto.randomUUID()),
  title:       z.string().default(""),   
  subtitle:    z.string().default(""),   
  startDate:   z.string().default(""),
  endDate:     z.string().default(""),
  current:     z.boolean().default(false),
  description: z.string().default(""),
})
export const TimelineBlockData = z.object({
  items: z.array(TimelineItemSchema).default([]),
})
export const SkillItemSchema = z.object({
  id:    z.string().default(() => crypto.randomUUID()),
  name:  z.string().default(""),
  level: z.number().min(0).max(100).default(50), 
})
export const SkillsBlockData = z.object({
  items: z.array(SkillItemSchema).default([]),
})
export const TagsBlockData = z.object({
  tags: z.array(z.string()).default([]),
})
export const LinkItemSchema = z.object({
  id:    z.string().default(() => crypto.randomUUID()),
  label: z.string().default(""),
  url:   z.string().default(""),
  icon:  z.string().default("link"),
})
export const LinksBlockData = z.object({
  items: z.array(LinkItemSchema).default([]),
})
export const DividerBlockData = z.object({
  style: z.enum(["solid", "dashed", "dotted"]).default("solid"),
})
export const SpacerBlockData = z.object({
  height: z.number().default(16), 
})

const BaseBlock = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  label: z.string().default(""),
  icon: z.string().default(""),
  visible: z.boolean().default(true),
});

export const BlockSchema = z.discriminatedUnion("type", [
  BaseBlock.extend({ type: z.literal("header"), data: HeaderBlockData.default({ fullName: "", jobTitle: "", email: "", phone: "", location: "", website: "", linkedin: "", avatarUrl: "" }) }),
  BaseBlock.extend({ type: z.literal("text"), data: TextBlockData.default({ content: "" }) }),
  BaseBlock.extend({ type: z.literal("timeline"), data: TimelineBlockData.default({ items: [] }) }),
  BaseBlock.extend({ type: z.literal("skills"), data: SkillsBlockData.default({ items: [] }) }),
  BaseBlock.extend({ type: z.literal("tags"), data: TagsBlockData.default({ tags: [] }) }),
  BaseBlock.extend({ type: z.literal("links"), data: LinksBlockData.default({ items: [] }) }),
  BaseBlock.extend({ type: z.literal("divider"), data: DividerBlockData.default({ style: "solid" }) }),
  BaseBlock.extend({ type: z.literal("spacer"), data: SpacerBlockData.default({ height: 16 }) }),
]);

export type Block = z.infer<typeof BlockSchema>;

export const ColumnSchema = z.object({
  id:     z.string().default(() => crypto.randomUUID()),
  width:  z.number().default(1),      
  blocks: z.array(BlockSchema).default([]),
})
export type Column = z.infer<typeof ColumnSchema>

export const CvDocumentSchema = z.object({
  layout:   z.enum(["single", "two-column", "sidebar-left", "sidebar-right"]).default("single"),
  theme:    z.object({
    primaryColor:  z.string().default("#7c3aed"),
    accentColor:   z.string().default("#f43f5e"),
    fontFamily:    z.string().default("Inter"),
    fontSize:      z.number().default(14),    
    lineHeight:    z.number().default(1.5),
  }).default({ primaryColor: "#7c3aed", accentColor: "#f43f5e", fontFamily: "Inter", fontSize: 14, lineHeight: 1.5 }),
  columns:  z.array(ColumnSchema).default([]),
})
export type CvDocument = z.infer<typeof CvDocumentSchema>