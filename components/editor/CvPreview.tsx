// components/editor/CvPreview.tsx
"use client"
import EditableTemplate from "./preview/EditableTemplate"
import { useAutoFit } from "@/lib/hooks/useAutoFit"

export default function CvPreview() {
  const autoFitRef = useAutoFit(true)

  return (
    <div className="editor-preview-wrapper flex justify-center w-full print:block print:w-[210mm]">
      <div className="cv-a4-page flex flex-col bg-white shadow-2xl print:shadow-none shrink-0 border border-slate-200 print:border-none print:m-0" style={{ width: "210mm", minHeight: "297mm" }} ref={autoFitRef}>
        <EditableTemplate />
      </div>
    </div>
  )
}
