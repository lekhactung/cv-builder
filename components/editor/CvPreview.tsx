"use client";
import { useEffect, useState, useRef } from "react";
import EditableTemplate from "./preview/EditableTemplate";
import styles from "./Editor.module.css";

export default function CvPreview({ zoom = "fit" }: { zoom?: string }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ available: 794, width: 794, height: 1123 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const page = pageRef.current;
    if (!wrapper || !page) return;
    const measure = () => {
      if (!wrapper.clientWidth || !page.offsetWidth) return;
      setSize({
        available: wrapper.clientWidth,
        width: page.offsetWidth,
        height: page.offsetHeight,
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    observer.observe(page);
    measure();
    return () => observer.disconnect();
  }, []);

  const scale = zoom === "fit" ? Math.min(1, size.available / size.width) : Number(zoom);

  return (
    <div ref={wrapperRef} className={`${styles.paperWrapper} cv-editor-paper-wrapper`}>
      <div
        className={`${styles.paperStage} cv-editor-paper-stage`}
        style={{ width: size.width * scale, height: size.height * scale }}
      >
        <div
          ref={pageRef}
          className={`${styles.paper} cv-a4-page`}
          style={{ transform: `scale(${scale})` }}
        >
          <EditableTemplate />
        </div>
      </div>
    </div>
  );
}
