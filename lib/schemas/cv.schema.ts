import { z } from "zod"
export const PersonalSchema = z.object({
    fullName: z.string().default(""),
    jobTitle: z.string().default(""),
    email: z.string().default(""),
    phone: z.string().default(""),
    location: z.string().default(""),
    website: z.string().default(""),
    linkedin: z.string().default(""),
    summary: z.string().default(""),
    avatarUrl: z.string().default(""),
});

export const ExperienceItemSchema = z.object({
    id: z.string().default(() => crypto.randomUUID()),
    company: z.string().default(""),
    position: z.string().default(""),
    startDate: z.string().default(""),
    endDate: z.string().default(""),
    current: z.boolean().default(false),
    location: z.string().default(""),
    description: z.string().default(""),
});

export const EducationItemSchema = z.object({
    id: z.string().default(() => crypto.randomUUID()),
    school: z.string().default(""),
    degree: z.string().default(""),
    field: z.string().default(""),
    startDate: z.string().default(""),
    endDate: z.string().default(""),
    gpa: z.string().default(""),
    description: z.string().default(""),
});
export const SkillItemSchema = z.object({
    id: z.string().default(() => crypto.randomUUID()),
    name: z.string().default(""),
    level: z.enum(["beginner", "intermediate", "advanced", "expert"]).default("intermediate"),
});
export const CvDataSchema = z.object({
    personal: PersonalSchema.default({} as any),
    experience: z.array(ExperienceItemSchema).default([]),
    education: z.array(EducationItemSchema).default([]),
    skills: z.array(SkillItemSchema).default([]),
    languages: z.array(z.object({
        id: z.string().default(() => crypto.randomUUID()),
        name: z.string().default(""),
        level: z.string().default(""),
    })).default([]),
    sectionOrder: z.array(z.string()).optional(),
});

export type CvData = z.infer<typeof CvDataSchema>
export type Personal = z.infer<typeof PersonalSchema>
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>
export type EducationItem = z.infer<typeof EducationItemSchema>
export type SkillItem = z.infer<typeof SkillItemSchema>
