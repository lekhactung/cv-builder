import type { CSSProperties } from "react";
import type { Block } from "./schemas/block.schema";
import { createDefaultBlock } from "./blocks/default";

export const FREEFORM_WIDTH = 794;
export const FREEFORM_HEIGHT = 1123;
export type FreeformFrame = NonNullable<Block["frame"]>;
export type FreeformTextBlock = Extract<Block, { type: "text" }>;
export const DEFAULT_TEXT_FORMAT = {
  fontSize: 14,
  bold: false,
  color: "#334155",
  align: "left" as const,
};
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function getFreeformFrame(block: Block): FreeformFrame {
  return block.frame ?? { x: 48, y: 48, width: 320, height: 128 };
}

export function moveFreeformFrame(frame: FreeformFrame, dx: number, dy: number): FreeformFrame {
  return {
    ...frame,
    x: clamp(frame.x + dx, 0, FREEFORM_WIDTH - frame.width),
    y: clamp(frame.y + dy, 0, FREEFORM_HEIGHT - frame.height),
  };
}

export function resizeFreeformFrame(frame: FreeformFrame, dx: number, dy: number): FreeformFrame {
  return {
    ...frame,
    width: clamp(frame.width + dx, 80, FREEFORM_WIDTH - frame.x),
    height: clamp(frame.height + dy, 32, FREEFORM_HEIGHT - frame.y),
  };
}

export function freeformFrameStyle(frame: FreeformFrame): CSSProperties {
  return {
    left: `${(frame.x / FREEFORM_WIDTH) * 100}%`,
    top: `${(frame.y / FREEFORM_HEIGHT) * 100}%`,
    width: `${(frame.width / FREEFORM_WIDTH) * 100}%`,
    height: `${(frame.height / FREEFORM_HEIGHT) * 100}%`,
  };
}

export function freeformTextStyle(block: FreeformTextBlock): CSSProperties {
  const format = { ...DEFAULT_TEXT_FORMAT, ...block.data.format };
  return {
    fontSize: format.fontSize,
    fontWeight: format.bold ? 700 : 400,
    color: format.color,
    textAlign: format.align,
  };
}

export function createFreeformText(
  label: string,
  content: string,
  frame: FreeformFrame,
  format: Partial<NonNullable<FreeformTextBlock["data"]["format"]>> = {},
): FreeformTextBlock {
  return {
    ...createDefaultBlock("text"),
    type: "text",
    label,
    frame,
    data: { content, format: { ...DEFAULT_TEXT_FORMAT, ...format } },
  };
}
