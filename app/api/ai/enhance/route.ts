import { google } from '@ai-sdk/google'
import { generateObject } from 'ai'
import { z } from 'zod'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { text, type } = await req.json();

        let systemPrompt = "Bạn là chuyên gia viết CV nhân sự cấp cao. Nhiệm vụ của bạn là viết lại đoạn văn bản của ứng viên cho chuyên nghiệp hơn. TUYỆT ĐỐI KHÔNG giải thích, không chào hỏi, không khuyên bảo. CHỈ trả về đúng 3 lựa chọn (options) khác nhau.";
        if (type === "summary") {
            systemPrompt += " Viết lại đoạn giới thiệu bản thân thành một đoạn văn ngắn gọn, súc tích, độ dài khoảng 3-4 câu.";
        } else if (type === "experience") {
            systemPrompt += " Viết lại mô tả kinh nghiệm làm việc thành các gạch đầu dòng (bullet points) chuyên nghiệp, bắt đầu bằng các action verbs (ví dụ: Quản lý, Thiết kế, Tối ưu hóa...).";
        }

        const { object } = await generateObject({
            model: google('gemini-3.5-flash'),
            system: systemPrompt,
            prompt: text,
            schema: z.object({
                options: z.array(z.string()).min(2).max(4).describe("Danh sách 3 phiên bản viết lại chuyên nghiệp nhất")
            })
        })
        return NextResponse.json({ result: object.options })
    } catch (error: any) {
        return NextResponse.json({ error: error?.message || "AI failed" }, { status: 500 });
    }
}