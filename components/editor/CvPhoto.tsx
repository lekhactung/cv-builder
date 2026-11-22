"use client";

import { useEffect, useId, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";
import { clampCvPhotoPosition, prepareCvPhoto, type CvPhotoPosition } from "@/lib/cv-photo";

interface Props {
  value: string;
  onChange: (value: string) => void;
  position?: CvPhotoPosition;
  onPositionChange: (position: CvPhotoPosition | undefined) => void;
}

export default function CvPhoto({ value, onChange, position, onPositionChange }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const active = useRef(true);
  const hintId = useId();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<CvPhotoPosition | null>(null);
  const drag = useRef<{
    pointerId: number;
    page: HTMLElement;
    origin: CvPhotoPosition;
    grab: CvPhotoPosition;
    start: CvPhotoPosition;
    next?: CvPhotoPosition;
  } | null>(null);
  const displayedPosition = draft ?? position;

  function geometry(button: HTMLButtonElement) {
    const page = button.closest<HTMLElement>(".cv-a4-page, .cv-dynamic");
    if (!page || !page.offsetWidth) return null;
    const rect = page.getBoundingClientRect();
    const scale = rect.width / page.offsetWidth;
    if (!scale) return null;
    const photo = button.getBoundingClientRect();
    return {
      page,
      rect,
      scale,
      photo,
      origin: {
        x: (photo.left - rect.left) / scale - (displayedPosition?.x ?? 0),
        y: (photo.top - rect.top) / scale - (displayedPosition?.y ?? 0),
      },
    };
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (processing || event.button !== 0 || drag.current) return;
    const measured = geometry(event.currentTarget);
    if (!measured) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      page: measured.page,
      origin: measured.origin,
      grab: {
        x: (event.clientX - measured.photo.left) / measured.scale,
        y: (event.clientY - measured.photo.top) / measured.scale,
      },
      start: { x: event.clientX, y: event.clientY },
    };
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    if (
      !current.next &&
      Math.hypot(event.clientX - current.start.x, event.clientY - current.start.y) < 3
    )
      return;
    const rect = current.page.getBoundingClientRect();
    const scale = rect.width / current.page.offsetWidth;
    if (!scale) return;
    current.next = clampCvPhotoPosition(
      {
        x: (event.clientX - rect.left) / scale - current.grab.x - current.origin.x,
        y: (event.clientY - rect.top) / scale - current.grab.y - current.origin.y,
      },
      current.origin,
      { width: current.page.offsetWidth, height: current.page.offsetHeight },
    );
    setDraft(current.next);
  }

  function cancelDrag() {
    drag.current = null;
    setDraft(null);
  }

  function finishDrag(event: PointerEvent<HTMLButtonElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    moveDrag(event);
    const next = drag.current.next;
    cancelDrag();
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (next && (next.x !== (position?.x ?? 0) || next.y !== (position?.y ?? 0)))
      onPositionChange(next);
  }

  function moveWithKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" && drag.current) {
      event.currentTarget.releasePointerCapture(drag.current.pointerId);
      cancelDrag();
      return;
    }
    const directions: Record<string, CvPhotoPosition> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const direction = directions[event.key];
    if (!direction || processing || drag.current) return;
    event.preventDefault();
    event.stopPropagation();
    const measured = geometry(event.currentTarget);
    if (!measured) return;
    const step = event.shiftKey ? 10 : 1;
    const next = clampCvPhotoPosition(
      {
        x: (position?.x ?? 0) + direction.x * step,
        y: (position?.y ?? 0) + direction.y * step,
      },
      measured.origin,
      { width: measured.page.offsetWidth, height: measured.page.offsetHeight },
    );
    if (next.x !== (position?.x ?? 0) || next.y !== (position?.y ?? 0)) onPositionChange(next);
  }

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  async function selectPhoto(file?: File) {
    if (!file) return;
    setError("");
    setProcessing(true);
    try {
      const photo = await prepareCvPhoto(file);
      if (active.current) onChange(photo);
    } catch (cause) {
      if (active.current) {
        setError(
          cause instanceof Error && cause.name === "Error"
            ? cause.message
            : "Không thể đọc ảnh này. Vui lòng chọn ảnh khác.",
        );
      }
    } finally {
      if (active.current) setProcessing(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={`cv-photo${value ? "" : " print:hidden"}`}>
      {value && (
        <div className="cv-photo-slot">
          <button
            type="button"
            className="cv-photo-move"
            disabled={processing}
            aria-label="Di chuyển ảnh trên CV"
            aria-describedby={hintId}
            title="Kéo ảnh để chọn vị trí. Dùng phím mũi tên để di chuyển."
            style={
              displayedPosition
                ? { transform: `translate(${displayedPosition.x}px, ${displayedPosition.y}px)` }
                : undefined
            }
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={finishDrag}
            onPointerCancel={cancelDrag}
            onLostPointerCapture={cancelDrag}
            onKeyDown={moveWithKeyboard}
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={value}
              width={80}
              height={80}
              unoptimized
              loading="eager"
              className="cv-avatar"
              alt="Ảnh chân dung trên CV"
              draggable={false}
            />
          </button>
        </div>
      )}
      <div className="cv-photo-controls print:hidden" onClick={(event) => event.stopPropagation()}>
        <div className="cv-photo-actions">
          <button
            type="button"
            disabled={processing}
            aria-describedby={hintId}
            onClick={() => input.current?.click()}
          >
            <Camera size={14} aria-hidden="true" />
            {processing ? "Đang xử lý ảnh…" : value ? "Đổi ảnh" : "Thêm ảnh"}
          </button>
          {value && (
            <>
              <button
                type="button"
                disabled={processing}
                onClick={() => {
                  setError("");
                  onChange("");
                }}
              >
                <Trash2 size={14} aria-hidden="true" /> Xóa ảnh
              </button>
              {position && (
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => onPositionChange(undefined)}
                >
                  Vị trí ban đầu
                </button>
              )}
            </>
          )}
        </div>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          aria-label="Chọn ảnh chân dung cho CV"
          hidden
          onChange={(event) => void selectPhoto(event.target.files?.[0])}
        />
        <p id={hintId} className="cv-photo-hint">
          {value
            ? "Kéo ảnh để chọn vị trí · Phím mũi tên để chỉnh · Shift để di chuyển nhanh · Esc để hủy kéo"
            : "JPG, PNG, WebP · Tối đa 5 MB · Cắt vuông ở giữa ảnh"}
        </p>
        {error && (
          <p className="cv-photo-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
