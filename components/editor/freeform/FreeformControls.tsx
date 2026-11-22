"use client";

import { Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react";
import { useEditorStore } from "@/lib/stores/editorStore";
import FreeformAlignment from "./FreeformAlignment";
import {
  createFreeformText,
  DEFAULT_TEXT_FORMAT,
  getFreeformFrame,
  moveFreeformFrame,
  resizeFreeformFrame,
  type FreeformTextBlock,
} from "@/lib/freeform";

export default function FreeformControls({
  onSelectBlock,
}: {
  onSelectBlock: (id: string) => void;
}) {
  const {
    document,
    selectedBlockIds,
    selectFreeformBlock,
    selectBlock,
    addBlock,
    removeBlock,
    updateBlock,
    toggleBlockVisible,
    reorderBlocks,
  } = useEditorStore();
  const column = document.columns[0];
  if (!column) return null;
  const blocks = column.blocks.filter((block): block is FreeformTextBlock => block.type === "text");
  const selectedCount = blocks.filter(
    (block) => block.visible && selectedBlockIds.includes(block.id),
  ).length;
  const selected =
    selectedCount === 1
      ? blocks.find((block) => block.visible && selectedBlockIds.includes(block.id))
      : undefined;
  const format = { ...DEFAULT_TEXT_FORMAT, ...selected?.data.format };
  const frame = selected ? getFreeformFrame(selected) : null;

  function addText(heading: boolean) {
    const offset = (blocks.length % 8) * 24;
    const block = createFreeformText(
      heading ? "Tiêu đề mới" : "Văn bản mới",
      heading ? "TIÊU ĐỀ MỚI" : "Nhấp đúp để nhập nội dung của bạn.",
      { x: 64 + offset, y: 240 + offset, width: 360, height: heading ? 64 : 144 },
      { fontSize: heading ? 24 : 14, bold: heading },
    );
    addBlock(column.id, block);
    selectBlock(block.id, column.id);
    onSelectBlock(block.id);
  }

  function changeFormat(patch: Partial<typeof format>) {
    if (selected)
      updateBlock(column.id, selected.id, (block) =>
        block.type === "text"
          ? { ...block, data: { ...block.data, format: { ...format, ...patch } } }
          : block,
      );
  }

  return (
    <div className="cv-freeform-controls">
      <div className="cv-freeform-add">
        <button type="button" onClick={() => addText(true)}>
          <Plus size={16} /> Tiêu đề
        </button>
        <button type="button" onClick={() => addText(false)}>
          <Plus size={16} /> Văn bản
        </button>
      </div>
      <FreeformAlignment />
      {selected && frame ? (
        <section className="cv-freeform-properties" aria-label="Định dạng hộp chữ">
          <strong>{selected.label}</strong>
          <label className="cv-freeform-content-label">
            Nội dung
            <textarea
              aria-label="Nội dung hộp chữ đã chọn"
              value={selected.data.content}
              onChange={(event) =>
                updateBlock(column.id, selected.id, (block) =>
                  block.type === "text"
                    ? { ...block, data: { ...block.data, content: event.target.value } }
                    : block,
                )
              }
            />
          </label>
          <p>Nhấp đúp hộp chữ trên trang để sửa nội dung.</p>
          <div className="cv-freeform-fields">
            <label>
              Cỡ chữ
              <input
                type="number"
                min={8}
                max={72}
                value={format.fontSize}
                onChange={(event) => {
                  const fontSize = event.target.valueAsNumber;
                  if (fontSize >= 8 && fontSize <= 72) changeFormat({ fontSize });
                }}
              />
            </label>
            <label>
              Màu chữ
              <input
                type="color"
                value={format.color}
                onChange={(event) => changeFormat({ color: event.target.value })}
              />
            </label>
          </div>
          <div className="cv-freeform-fields">
            <button
              type="button"
              aria-pressed={format.bold}
              onClick={() => changeFormat({ bold: !format.bold })}
            >
              <b>Đậm</b>
            </button>
            <label>
              Căn chữ
              <select
                value={format.align}
                onChange={(event) =>
                  changeFormat({ align: event.target.value as typeof format.align })
                }
              >
                <option value="left">Trái</option>
                <option value="center">Giữa</option>
                <option value="right">Phải</option>
              </select>
            </label>
          </div>
          <div className="cv-freeform-fields">
            <label>
              Vị trí X
              <input
                type="number"
                min={0}
                max={794 - frame.width}
                value={Math.round(frame.x)}
                onChange={(event) => {
                  if (Number.isFinite(event.target.valueAsNumber))
                    updateBlock(column.id, selected.id, (block) => ({
                      ...block,
                      frame: moveFreeformFrame(frame, event.target.valueAsNumber - frame.x, 0),
                    }));
                }}
              />
            </label>
            <label>
              Vị trí Y
              <input
                type="number"
                min={0}
                max={1123 - frame.height}
                value={Math.round(frame.y)}
                onChange={(event) => {
                  if (Number.isFinite(event.target.valueAsNumber))
                    updateBlock(column.id, selected.id, (block) => ({
                      ...block,
                      frame: moveFreeformFrame(frame, 0, event.target.valueAsNumber - frame.y),
                    }));
                }}
              />
            </label>
          </div>
          <div className="cv-freeform-fields">
            <label>
              Rộng
              <input
                type="number"
                min={80}
                max={794 - frame.x}
                value={Math.round(frame.width)}
                onChange={(event) => {
                  if (Number.isFinite(event.target.valueAsNumber))
                    updateBlock(column.id, selected.id, (block) => ({
                      ...block,
                      frame: resizeFreeformFrame(
                        frame,
                        event.target.valueAsNumber - frame.width,
                        0,
                      ),
                    }));
                }}
              />
            </label>
            <label>
              Cao
              <input
                type="number"
                min={32}
                max={1123 - frame.y}
                value={Math.round(frame.height)}
                onChange={(event) => {
                  if (Number.isFinite(event.target.valueAsNumber))
                    updateBlock(column.id, selected.id, (block) => ({
                      ...block,
                      frame: resizeFreeformFrame(
                        frame,
                        0,
                        event.target.valueAsNumber - frame.height,
                      ),
                    }));
                }}
              />
            </label>
          </div>
          <div className="cv-freeform-fields">
            <button
              type="button"
              onClick={() =>
                reorderBlocks(column.id, [
                  ...column.blocks
                    .filter((block) => block.id !== selected.id)
                    .map((block) => block.id),
                  selected.id,
                ])
              }
            >
              Lên trước
            </button>
            <button
              type="button"
              onClick={() =>
                reorderBlocks(column.id, [
                  selected.id,
                  ...column.blocks
                    .filter((block) => block.id !== selected.id)
                    .map((block) => block.id),
                ])
              }
            >
              Ra sau
            </button>
          </div>
          <div className="cv-freeform-fields">
            <button
              type="button"
              onClick={() => {
                const copy = {
                  ...structuredClone(selected),
                  id: crypto.randomUUID(),
                  frame: moveFreeformFrame(frame, 16, 16),
                };
                addBlock(column.id, copy);
                selectBlock(copy.id, column.id);
              }}
            >
              <Copy size={14} /> Nhân bản
            </button>
            <button
              type="button"
              onClick={() => {
                removeBlock(column.id, selected.id);
                selectBlock(null);
              }}
            >
              <Trash2 size={14} /> Xóa
            </button>
          </div>
        </section>
      ) : (
        <p className="cv-freeform-help">
          {selectedCount > 1
            ? "Đang chọn nhiều hộp. Dùng các nút phía trên để căn chỉnh và chia đều khoảng cách."
            : "Chọn một hộp chữ trên trang hoặc trong danh sách để chỉnh vị trí, kích thước và kiểu chữ."}
        </p>
      )}
      <h3>
        Các hộp chữ <span>{blocks.length}</span>
      </h3>
      <div className="cv-freeform-layers">
        {[...blocks].reverse().map((block) => (
          <div key={block.id} data-selected={selectedBlockIds.includes(block.id)}>
            <input
              type="checkbox"
              className="cv-freeform-layer-check"
              aria-label={`Chọn thêm ${block.label}`}
              disabled={!block.visible}
              checked={block.visible && selectedBlockIds.includes(block.id)}
              onChange={() => selectFreeformBlock(block.id, column.id, true)}
            />
            <button
              type="button"
              className="cv-freeform-layer-select"
              aria-pressed={selectedBlockIds.includes(block.id)}
              onClick={(event) => {
                selectFreeformBlock(
                  block.id,
                  column.id,
                  event.shiftKey || event.ctrlKey || event.metaKey,
                );
                if (!event.shiftKey && !event.ctrlKey && !event.metaKey) onSelectBlock(block.id);
              }}
            >
              <strong>{block.label}</strong>
              <span>{block.data.content.slice(0, 60) || "Chưa có nội dung"}</span>
            </button>
            <button
              type="button"
              aria-label={`${block.visible ? "Ẩn" : "Hiện"} ${block.label}`}
              onClick={() => toggleBlockVisible(column.id, block.id)}
            >
              {block.visible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
        ))}
      </div>
      <p className="cv-freeform-help">
        Phím mũi tên: di chuyển · Shift: bước 10 px · Alt + mũi tên: đổi kích thước · Enter: sửa chữ
        · Esc: hủy kéo · Delete: xóa. Có thể hoàn tác trên thanh công cụ.
      </p>
    </div>
  );
}
