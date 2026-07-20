import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CvDataSchema } from "@/lib/schemas/cv.schema";
import EditorShell from "@/components/editor/EditorShell";

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
        return (
            <EditorShell
                cvId="new"
                initialTitle="CV Không Tiêu Đề"
                initialData={CvDataSchema.parse({})}
                initialTemplate={template ?? "Modern"}
            />
        );
    }
    const cv = await prisma.cV.findFirst({
        where: { id, userId: session.user.id },
    });

    if (!cv) notFound();

    const cvData = CvDataSchema.parse(cv.data ?? {});

    return (
        <EditorShell
            cvId={cv.id}
            initialTitle={cv.title}
            initialData={cvData}
            initialTemplate={cv.template}
        />
    );
}
