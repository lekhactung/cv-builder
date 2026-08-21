import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { creditService } from "@/lib/services/credit.service";
import { entitlementService } from "@/lib/services/entitlement.service";

const CREDIT_COST = 10;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const canUse = await entitlementService.canUseAI(userId);
  if (!canUse) {
    return NextResponse.json(
      { error: "Gói của bạn không hỗ trợ tính năng AI", code: "FEATURE_NOT_ALLOWED" },
      { status: 403 }
    );
  }

  const hasCredits = await creditService.hasEnoughCredits(userId, CREDIT_COST);
  if (!hasCredits) {
    return NextResponse.json(
      {
        error: `Không đủ credits. Cần ${CREDIT_COST} credits để dùng AI.`,
        code: "INSUFFICIENT_CREDITS",
        upgradeUrl: "/pricing",
      },
      { status: 402 }
    );
  }

  const { text, type, cvId } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Vui lòng nhập nội dung trước" }, { status: 400 });
  }

  let transaction;
  try {
    transaction = await creditService.consumeCredits(
      userId,
      CREDIT_COST,
      "AI_REWRITE",
      `AI Enhance (${type ?? "text"})`,
      cvId ?? undefined
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Không thể trừ credits", code: "CREDIT_DEDUCTION_FAILED" },
      { status: 500 }
    );
  }

  // 4. Gọi Gemini API
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    }

    const google = createGoogleGenerativeAI({ apiKey });

    let systemPrompt =
      "Bạn là chuyên gia viết CV. Nhiệm vụ của bạn là viết lại đoạn văn bản của ứng viên cho chuyên nghiệp hơn. TUYỆT ĐỐI KHÔNG giải thích, không chào hỏi, không khuyên bảo. CHỈ trả về đúng 3 lựa chọn (options) khác nhau.";

    if (type === "summary") {
      systemPrompt +=
        " Viết lại đoạn giới thiệu bản thân thành một đoạn văn ngắn gọn, súc tích, độ dài khoảng 3-4 câu.";
    } else if (type === "experience") {
      systemPrompt +=
        " Viết lại mô tả kinh nghiệm làm việc thành các gạch đầu dòng (bullet points) chuyên nghiệp, bắt đầu bằng các action verbs.";
    }

    const { object } = await generateObject({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: text,
      schema: z.object({
        options: z
          .array(z.string())
          .min(2)
          .max(4)
          .describe("Danh sách 3 phiên bản viết lại chuyên nghiệp nhất"),
      }),
    });

    return NextResponse.json({ result: object.options });
  } catch (error: any) {
    try {
      await creditService.refundCredits(
        userId,
        CREDIT_COST,
        "Hoàn trả: AI request thất bại",
        transaction.id
      );
    } catch (refundErr) {
      console.error("[AI_REFUND_ERROR]", refundErr);
    }

    return NextResponse.json(
      { error: error?.message || "AI failed" },
      { status: 500 }
    );
  }
}