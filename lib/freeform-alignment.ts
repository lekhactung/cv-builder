import type { CvDocument } from "./schemas/block.schema";
import {
  FREEFORM_WIDTH,
  FREEFORM_HEIGHT,
  getFreeformFrame,
  moveFreeformFrame,
  type FreeformFrame,
} from "./freeform";

export const FREEFORM_MARGIN = 48;
export type FrameItem = { id: string; frame: FreeformFrame };
export type FrameUpdates = Record<string, FreeformFrame>;
export type Alignment = "left" | "center-x" | "right" | "top" | "center-y" | "bottom";
export type AlignmentGuide = { axis: "x" | "y"; position: number };

export function getFreeformItems(doc: CvDocument, ids?: string[]): FrameItem[] {
  return doc.columns
    .flatMap((column) => column.blocks)
    .filter((block) => block.visible && block.type === "text" && (!ids || ids.includes(block.id)))
    .map((block) => ({ id: block.id, frame: getFreeformFrame(block) }));
}

export function freeformBounds(items: FrameItem[]): FreeformFrame {
  if (!items.length) return { x: 0, y: 0, width: 0, height: 0 };
  const x = Math.min(...items.map(({ frame }) => frame.x));
  const y = Math.min(...items.map(({ frame }) => frame.y));
  return {
    x,
    y,
    width: Math.max(...items.map(({ frame }) => frame.x + frame.width)) - x,
    height: Math.max(...items.map(({ frame }) => frame.y + frame.height)) - y,
  };
}

export function translateFreeformItems(items: FrameItem[], dx: number, dy: number): FrameUpdates {
  if (!items.length) return {};
  const bounds = freeformBounds(items);
  const next = moveFreeformFrame(bounds, dx, dy);
  return Object.fromEntries(
    items.map(({ id, frame }) => [
      id,
      moveFreeformFrame(frame, next.x - bounds.x, next.y - bounds.y),
    ]),
  );
}

export function alignFreeformItems(
  items: FrameItem[],
  alignment: Alignment,
  scope: "selection" | "page",
): FrameUpdates {
  if (!items.length) return {};
  const bounds =
    scope === "selection"
      ? freeformBounds(items)
      : {
          x: FREEFORM_MARGIN,
          y: FREEFORM_MARGIN,
          width: FREEFORM_WIDTH - 2 * FREEFORM_MARGIN,
          height: FREEFORM_HEIGHT - 2 * FREEFORM_MARGIN,
        };
  return Object.fromEntries(
    items.map(({ id, frame }) => {
      let x = frame.x,
        y = frame.y;
      if (alignment === "left") x = bounds.x;
      if (alignment === "center-x") x = bounds.x + (bounds.width - frame.width) / 2;
      if (alignment === "right") x = bounds.x + bounds.width - frame.width;
      if (alignment === "top") y = bounds.y;
      if (alignment === "center-y") y = bounds.y + (bounds.height - frame.height) / 2;
      if (alignment === "bottom") y = bounds.y + bounds.height - frame.height;
      return [id, moveFreeformFrame(frame, x - frame.x, y - frame.y)];
    }),
  );
}

/** Keep the first/last boxes fixed, equalizing the gaps between variable-sized boxes. */
export function distributeFreeformItems(items: FrameItem[], axis: "x" | "y"): FrameUpdates | null {
  if (items.length < 3) return null;
  const size = axis === "x" ? "width" : "height";
  const ordered = [...items].sort((a, b) => a.frame[axis] - b.frame[axis]);
  const first = ordered[0].frame,
    last = ordered[ordered.length - 1].frame;
  const space =
    last[axis] +
    last[size] -
    first[axis] -
    ordered.reduce((sum, item) => sum + item.frame[size], 0);
  if (space < -0.000001) return null;
  const gap = Math.max(0, space) / (items.length - 1);
  let cursor = first[axis];
  return Object.fromEntries(
    ordered.map(({ id, frame }, index) => {
      const next = { ...frame, [axis]: index === ordered.length - 1 ? last[axis] : cursor };
      cursor += frame[size] + gap;
      return [id, next];
    }),
  );
}

/** Snap edges and centers in page coordinates; the caller supplies a zoom-adjusted tolerance. */
export function snapFreeformFrame(
  frame: FreeformFrame,
  references: FrameItem[],
  tolerance: number,
): { frame: FreeformFrame; guides: AlignmentGuide[] } {
  const guides: AlignmentGuide[] = [];
  const next = { ...frame };
  for (const axis of ["x", "y"] as const) {
    const size = axis === "x" ? "width" : "height";
    const limit = axis === "x" ? FREEFORM_WIDTH : FREEFORM_HEIGHT;
    const targets = [
      FREEFORM_MARGIN,
      limit / 2,
      limit - FREEFORM_MARGIN,
      0,
      limit,
      ...references.flatMap(({ frame: other }) => [
        other[axis],
        other[axis] + other[size] / 2,
        other[axis] + other[size],
      ]),
    ];
    let best = tolerance + 0.000001;
    let guide: number | undefined;
    for (const offset of [0, frame[size] / 2, frame[size]]) {
      for (const target of targets) {
        const delta = target - (frame[axis] + offset);
        const position = frame[axis] + delta;
        if (Math.abs(delta) < best && position >= 0 && position + frame[size] <= limit) {
          best = Math.abs(delta);
          next[axis] = position;
          guide = target;
        }
      }
    }
    if (guide !== undefined) guides.push({ axis, position: guide });
  }
  return { frame: next, guides };
}

export function applyFreeformFrames(doc: CvDocument, updates: FrameUpdates): CvDocument {
  if (doc.layout !== "freeform") return doc;
  let changed = false;
  const columns = doc.columns.map((column) => ({
    ...column,
    blocks: column.blocks.map((block) => {
      const next = updates[block.id];
      if (!next || block.type !== "text") return block;
      const previous = getFreeformFrame(block);
      if (
        previous.x === next.x &&
        previous.y === next.y &&
        previous.width === next.width &&
        previous.height === next.height
      )
        return block;
      changed = true;
      return { ...block, frame: next };
    }),
  }));
  return changed ? { ...doc, columns } : doc;
}
