"use client";

import { useEffect, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import { Grip, Maximize2 } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editorStore";
import {
  FREEFORM_WIDTH,
  FREEFORM_HEIGHT,
  freeformFrameStyle,
  freeformTextStyle,
  getFreeformFrame,
  moveFreeformFrame,
  resizeFreeformFrame,
  type FreeformFrame,
  type FreeformTextBlock,
} from "@/lib/freeform";
import {
  FREEFORM_MARGIN,
  freeformBounds,
  getFreeformItems,
  snapFreeformFrame,
  translateFreeformItems,
  type FrameItem,
  type FrameUpdates,
  type AlignmentGuide,
} from "@/lib/freeform-alignment";

type DragPreview = { frames: FrameUpdates; guides: AlignmentGuide[] };

export default function FreeformEditor() {
  const { document, selectBlock, selectedBlockIds, freeformMargins } = useEditorStore();
  const [preview, setPreview] = useState<DragPreview | null>(null);
  const selectedItems = getFreeformItems(document, selectedBlockIds).map((item) => ({
    ...item,
    frame: preview?.frames[item.id] ?? item.frame,
  }));
  return (
    <div
      className="cv-freeform-page cv-layout-freeform"
      style={{
        fontFamily: `var(--font-inter), ${document.theme.fontFamily}, Arial, sans-serif`,
        lineHeight: document.theme.lineHeight,
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) selectBlock(null);
      }}
    >
      {freeformMargins && (
        <div
          aria-hidden="true"
          className="cv-freeform-margin"
          style={freeformFrameStyle({
            x: FREEFORM_MARGIN,
            y: FREEFORM_MARGIN,
            width: FREEFORM_WIDTH - 2 * FREEFORM_MARGIN,
            height: FREEFORM_HEIGHT - 2 * FREEFORM_MARGIN,
          })}
        />
      )}
      {selectedItems.length > 1 && (
        <div
          aria-hidden="true"
          className="cv-freeform-group"
          style={freeformFrameStyle(freeformBounds(selectedItems))}
        />
      )}
      {document.columns.map((column) =>
        column.blocks.map(
          (block) =>
            block.visible &&
            block.type === "text" && (
              <FreeformBox
                key={block.id}
                block={block}
                columnId={column.id}
                previewFrame={preview?.frames[block.id]}
                onPreview={setPreview}
              />
            ),
        ),
      )}
      {preview?.guides.map((guide) => (
        <div
          key={guide.axis}
          aria-hidden="true"
          className={`cv-freeform-guide cv-freeform-guide-${guide.axis}`}
          style={
            guide.axis === "x"
              ? { left: `${(guide.position / FREEFORM_WIDTH) * 100}%` }
              : { top: `${(guide.position / FREEFORM_HEIGHT) * 100}%` }
          }
        />
      ))}
    </div>
  );
}

function FreeformBox({
  block,
  columnId,
  previewFrame,
  onPreview,
}: {
  block: FreeformTextBlock;
  columnId: string;
  previewFrame?: FreeformFrame;
  onPreview: (preview: DragPreview | null) => void;
}) {
  const {
    updateBlock,
    selectBlock,
    selectFreeformBlock,
    selectedBlockIds,
    updateFrames,
    updateDocument,
  } = useEditorStore();
  const selected = selectedBlockIds.includes(block.id);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(block.data.content);
  const [overflow, setOverflow] = useState(false);
  const textElement = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    owner: HTMLElement;
    page: HTMLElement;
    start: { x: number; y: number };
    frame: FreeformFrame;
    items: FrameItem[];
    references: FrameItem[];
    started?: boolean;
    mode: "move" | "resize";
    next?: FrameUpdates;
  } | null>(null);
  const frame = previewFrame ?? getFreeformFrame(block);
  const textStyle = freeformTextStyle(block);

  useEffect(() => {
    const element = textElement.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setOverflow(
        element.scrollHeight > element.clientHeight + 1 ||
          element.scrollWidth > element.clientWidth + 1,
      ),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [block.data.content, block.data.format, text]);

  function startDrag(event: PointerEvent<HTMLElement>, mode: "move" | "resize") {
    if (editing || event.button !== 0 || drag.current) return;
    event.preventDefault();
    event.stopPropagation();
    if (mode === "move" && (event.shiftKey || event.ctrlKey || event.metaKey)) {
      selectFreeformBlock(block.id, columnId, true);
      return;
    }
    const page = event.currentTarget.closest<HTMLElement>(".cv-freeform-page");
    if (!page) return;
    const rect = page.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    if (mode === "resize" || !useEditorStore.getState().selectedBlockIds.includes(block.id))
      selectFreeformBlock(block.id, columnId);
    const state = useEditorStore.getState();
    const items = getFreeformItems(state.document, state.selectedBlockIds);
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId,
      owner: event.currentTarget,
      page,
      mode,
      frame: freeformBounds(items),
      items,
      references: getFreeformItems(state.document).filter(
        (item) => !state.selectedBlockIds.includes(item.id),
      ),
      start: {
        x: ((event.clientX - rect.left) / rect.width) * FREEFORM_WIDTH,
        y: ((event.clientY - rect.top) / rect.height) * FREEFORM_HEIGHT,
      },
    };
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    const rect = current.page.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dx = ((event.clientX - rect.left) / rect.width) * FREEFORM_WIDTH - current.start.x;
    const dy = ((event.clientY - rect.top) / rect.height) * FREEFORM_HEIGHT - current.start.y;
    if (
      !current.started &&
      Math.hypot((dx * rect.width) / FREEFORM_WIDTH, (dy * rect.height) / FREEFORM_HEIGHT) < 3
    )
      return;
    current.started = true;
    let guides: AlignmentGuide[] = [];
    if (current.mode === "resize") {
      current.next = { [block.id]: resizeFreeformFrame(current.frame, dx, dy) };
    } else {
      let moved = moveFreeformFrame(current.frame, dx, dy);
      if (useEditorStore.getState().freeformSnap && !event.altKey) {
        const snapped = snapFreeformFrame(
          moved,
          current.references,
          (6 * FREEFORM_WIDTH) / rect.width,
        );
        moved = snapped.frame;
        guides = snapped.guides;
      }
      current.next = translateFreeformItems(
        current.items,
        moved.x - current.frame.x,
        moved.y - current.frame.y,
      );
    }
    onPreview({ frames: current.next, guides });
  }

  function cancelDrag() {
    const current = drag.current;
    drag.current = null;
    onPreview(null);
    if (current?.owner.hasPointerCapture(current.id))
      current.owner.releasePointerCapture(current.id);
  }

  function finishDrag(event: PointerEvent<HTMLElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    moveDrag(event);
    const next = current.next;
    cancelDrag();
    if (next) updateFrames(next);
  }

  function startEditing() {
    selectBlock(block.id, columnId);
    setText(block.data.content);
    setEditing(true);
  }

  function saveText() {
    setEditing(false);
    if (text !== block.data.content)
      updateBlock(columnId, block.id, (previous) =>
        previous.type === "text"
          ? { ...previous, data: { ...previous.data, content: text } }
          : previous,
      );
  }

  function handleKey(event: KeyboardEvent<HTMLElement>) {
    if (editing) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      if (drag.current) cancelDrag();
      return;
    }
    if (event.key === "Escape") {
      cancelDrag();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      startEditing();
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      const ids = useEditorStore.getState().selectedBlockIds.includes(block.id)
        ? getFreeformItems(
            useEditorStore.getState().document,
            useEditorStore.getState().selectedBlockIds,
          ).map((item) => item.id)
        : [block.id];
      updateDocument((doc) => ({
        ...doc,
        columns: doc.columns.map((column) => ({
          ...column,
          blocks: column.blocks.filter((item) => !ids.includes(item.id)),
        })),
      }));
      selectBlock(null);
      return;
    }
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const direction = directions[event.key];
    if (!direction || drag.current) return;
    event.preventDefault();
    event.stopPropagation();
    const step = event.shiftKey ? 10 : 1;
    if (!useEditorStore.getState().selectedBlockIds.includes(block.id))
      selectFreeformBlock(block.id, columnId);
    const state = useEditorStore.getState();
    if (event.altKey) {
      selectFreeformBlock(block.id, columnId);
      updateFrames({
        [block.id]: resizeFreeformFrame(frame, direction[0] * step, direction[1] * step),
      });
    } else
      updateFrames(
        translateFreeformItems(
          getFreeformItems(state.document, state.selectedBlockIds),
          direction[0] * step,
          direction[1] * step,
        ),
      );
  }

  return (
    <div
      id={`cv-block-${block.id}`}
      tabIndex={0}
      role="group"
      aria-label={`${block.label || "Hộp văn bản"}. Enter để sửa, phím mũi tên để di chuyển.`}
      className={`cv-freeform-box cv-freeform-interactive${selected ? " is-selected" : ""}${editing ? " is-editing" : ""}`}
      style={freeformFrameStyle(frame)}
      onFocus={(event) => {
        if (
          event.target === event.currentTarget &&
          !useEditorStore.getState().selectedBlockIds.includes(block.id)
        )
          selectFreeformBlock(block.id, columnId);
      }}
      onPointerDown={(event) => {
        if (!(event.target as HTMLElement).closest("button, textarea")) startDrag(event, "move");
      }}
      onPointerMove={moveDrag}
      onPointerUp={finishDrag}
      onPointerCancel={(event) => {
        if (drag.current?.id === event.pointerId) cancelDrag();
      }}
      onLostPointerCapture={(event) => {
        if (drag.current?.id === event.pointerId) cancelDrag();
      }}
      onDoubleClick={startEditing}
      onKeyDown={handleKey}
    >
      <div ref={textElement} className="cv-freeform-text" style={textStyle}>
        {editing ? text : block.data.content}
      </div>
      {editing && (
        <textarea
          autoFocus
          aria-label={`Nội dung ${block.label || "hộp văn bản"}`}
          className="cv-freeform-edit"
          style={textStyle}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={saveText}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Escape") {
              event.preventDefault();
              setEditing(false);
            }
          }}
        />
      )}
      {selected && !editing && (
        <>
          <button
            type="button"
            className="cv-freeform-grip"
            aria-label={`Kéo ${block.label || "hộp văn bản"}`}
            onPointerDown={(event) => startDrag(event, "move")}
          >
            <Grip size={14} /> Di chuyển
          </button>
          <button
            type="button"
            className="cv-freeform-resize"
            aria-label={`Đổi kích thước ${block.label || "hộp văn bản"}`}
            onPointerDown={(event) => startDrag(event, "resize")}
          >
            <Maximize2 size={12} />
          </button>
          {overflow && (
            <span role="status" className="cv-freeform-overflow">
              Nội dung vượt khung. Kéo góc dưới để mở rộng.
            </span>
          )}
        </>
      )}
    </div>
  );
}
