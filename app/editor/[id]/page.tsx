import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CvDocumentSchema } from "@/lib/schemas/block.schema";
import EditorShell from "@/components/editor/EditorShell";
import { TEMPLATES } from "@/lib/blocks/template";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cv = await prisma.cV.findUnique({ where: { id }, select: { title: true } });
    return { title: `${cv?.title ?? "Editor"}` };
}

export default async function EditorPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ template?: string }>
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth");
    
    const { id } = await params;
    if (id === "new") {
        const { template } = await searchParams;
        const templateId = template || "single";
        const templateName = TEMPLATES.find(t => t.id === templateId)?.name ?? "Đơn giản";
        return (
            <EditorShell
                cvId="new"
                initialTitle="CV Không Tiêu Đề"
                initialTemplateName={templateName}
                initialTemplateId={templateId}
                initialDocument={CvDocumentSchema.parse({})}
            />
        );
    }
    const cv = await prisma.cV.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!cv) notFound();

    const cvData = CvDocumentSchema.parse(cv.data ?? {});

    const cvTemplateId = cv.template ?? "single";
    const cvTemplateName = TEMPLATES.find(t => t.id === cvTemplateId)?.name ?? cvTemplateId;

    return (
        <EditorShell
            cvId={cv.id}
            initialTitle={cv.title}
            initialTemplateName={cvTemplateName}
            initialTemplateId={cvTemplateId}
            initialDocument={cvData}
        />
    );
}
