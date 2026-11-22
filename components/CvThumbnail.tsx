"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DynamicTemplate from "@/components/editor/preview/DynamicTemplate";
import ModernTemplate from "@/components/editor/preview/ModernTemplate";
import { CvDocumentSchema } from "@/lib/schemas/block.schema";
import { CvDataSchema } from "@/lib/schemas/cv.schema";

interface Props {
  data: unknown;
  label: string;
}

/** Read-only first-page preview. Never connects to the editor store or saves sample data. */
export default function CvThumbnail({ data, label }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const preview = useMemo(() => {
    let value: unknown = data;
    try {
      if (typeof data === "string") value = JSON.parse(data);
    } catch {
      // A malformed old CV must not break the rest of the gallery.
      return null;
    }
    if (!value || typeof value !== "object") return null;
    if ("columns" in value) {
      const result = CvDocumentSchema.safeParse(value);
      return result.success &&
        result.data.columns.some((col) => col.blocks.some((b) => b.visible)) ? (
        <DynamicTemplate doc={result.data} />
      ) : null;
    }
    if ("personal" in value) {
      const result = CvDataSchema.safeParse(value);
      return result.success ? (
        <ModernTemplate data={result.data} sectionOrder={result.data.sectionOrder} />
      ) : null;
    }
    return null;
  }, [data]);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setScale(Math.min(entry.contentRect.width / 794, entry.contentRect.height / 1123)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={container} className="cv-thumbnail" role="img" aria-label={label}>
      {preview ? (
        <div
          className="cv-thumbnail-page"
          aria-hidden="true"
          style={{ transform: `scale(${scale})`, visibility: scale ? "visible" : "hidden" }}
        >
          {preview}
        </div>
      ) : (
        <span className="cv-thumbnail-empty" aria-hidden="true">
          Chưa có nội dung xem trước
        </span>
      )}
    </div>
  );
}
