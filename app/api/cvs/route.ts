import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CvDataSchema } from "@/lib/schemas/cv.schema";
import { entitlementService } from "@/lib/services/entitlement.service";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body   = await req.json().catch(() => ({}));
  const templateId = (body.template ?? "single").toString().trim();

  const canAccessTemplate = await entitlementService.canUserAccessTemplate(
    userId,
    templateId
  );
  if (!canAccessTemplate) {
    return NextResponse.json(
      {
        error: "Template này không có trong gói của bạn. Vui lòng nâng cấp.",
        code: "TEMPLATE_NOT_ALLOWED",
        upgradeUrl: "/pricing",
      },
      { status: 403 }
    );
  }

  const canCreate = await entitlementService.canCreateMoreCVs(userId);
  if (!canCreate) {
    return NextResponse.json(
      {
        error: "Bạn đã đạt giới hạn số CV. Vui lòng nâng cấp gói.",
        code: "CV_LIMIT_REACHED",
        upgradeUrl: "/pricing",
      },
      { status: 403 }
    );
  }

  const cv = await prisma.cV.create({
    data: {
      title:    (body.title ?? "CV Không Tiêu Đề").toString().trim().slice(0, 100),
      template: templateId,
      data:     CvDataSchema.parse({}).valueOf() as object,
      userId,
    },
  });

  return NextResponse.json({ cv }, { status: 201 });
}