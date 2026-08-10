// components/editor/CvPreview.tsx
"use client"
import { useEffect, useState, useRef } from "react"
import EditableTemplate from "./preview/EditableTemplate"
import { useAutoFit } from "@/lib/hooks/useAutoFit"

export default function CvPreview() {
  const autoFitRef = useAutoFit(true)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      if (!wrapperRef.current) return
      // 210mm in pixels is approx 794px. We add a little padding.
      const A4_WIDTH = 794
      const containerWidth = wrapperRef.current.clientWidth - 32 // 16px padding each side
      
      if (containerWidth < A4_WIDTH) {
        setScale(containerWidth / A4_WIDTH)
      } else {
        setScale(1)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div ref={wrapperRef} className="editor-preview-wrapper flex justify-center w-full print:block print:w-[210mm] overflow-x-hidden">
      <div 
        className="cv-a4-page flex flex-col bg-white shadow-2xl print:shadow-none shrink-0 border border-slate-200 print:border-none print:m-0" 
        style={{ 
            width: "210mm", 
            minHeight: "297mm",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            marginBottom: scale < 1 ? `-${(1 - scale) * 1122}px` : "0" // 297mm approx 1122px
        }} 
        ref={autoFitRef}
      >
        <EditableTemplate />
      </div>
    </div>
  )
}
