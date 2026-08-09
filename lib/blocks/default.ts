import { Block, BlockType, DividerBlockData, HeaderBlockData, LinksBlockData, SkillsBlockData, SpacerBlockData, TagsBlockData, TextBlockData, TimelineBlockData } from "@/lib/schemas/block.schema"

export function createDefaultBlock(type: BlockType): Block {
    const id = crypto.randomUUID()

    const defaults: Record<BlockType, Partial<Block>> = {
        header: {
            label: "Thông tin cá nhân",
            data: HeaderBlockData.parse({})
        },
        text: {
            label: "Giới thiệu bản thân",
            data: TextBlockData.parse({})
        },
        timeline: {
            label: "Kinh nghiệm làm việc",
            data: TimelineBlockData.parse({})
        },
        skills: {
            label: "Kỹ năng",
            data: SkillsBlockData.parse({})
        },
        tags: {
            label: "Kỹ năng",
            data: TagsBlockData.parse({})
        },
        links: {
            label: "Liên kết",
            data: LinksBlockData.parse({})
        },
        divider: {
            label: "Divider", icon: "─",
            data: DividerBlockData.parse({})
        },
        spacer: {
            label: "Khoảng trống", icon: "↕",
            data: SpacerBlockData.parse({})
        },
    }
    return {
        id,
        type,
        visible: true,
        ...defaults[type],
    } as Block
}