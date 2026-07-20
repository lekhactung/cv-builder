"use client"
import { useState, useCallback } from "react"
import { pdf } from "@react-pdf/renderer"
import { CvData } from "../schemas/cv.schema"
import { pdfTemplates } from "./templatreRegistry"

export function usePdfExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportPdf = useCallback(
        async (data: CvData, template: string, fileName: string) => {
            setIsExporting(true);
            try {
                const importer = pdfTemplates[template as keyof typeof pdfTemplates];
                if (!importer) {
                    throw new Error("Template không tồn tại");
                }
                const { default: DocumentComponent } = await importer();

                const blob = await pdf(
                    <DocumentComponent data={data} />
                ).toBlob();

                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${fileName || "CV"}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
            catch (error) {
                console.error("Lỗi xuất PDF:", error);
                alert("Có lỗi khi xuất PDF. Vui lòng thử lại!");
            }
            finally {
                setIsExporting(false);
            }
        },
        []
    );
    return { exportPdf, isExporting };
}