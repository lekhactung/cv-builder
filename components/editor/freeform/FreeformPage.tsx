import type { CvDocument } from "@/lib/schemas/block.schema";
import { freeformFrameStyle, freeformTextStyle, getFreeformFrame } from "@/lib/freeform";

/** Shares the exact saved geometry with the editable page, without editor controls. */
export default function FreeformPage({ doc }: { doc: CvDocument }) {
  return (
    <div
      className="cv-freeform-page cv-layout-freeform"
      style={{
        fontFamily: `var(--font-inter), ${doc.theme.fontFamily}, Arial, sans-serif`,
        lineHeight: doc.theme.lineHeight,
      }}
    >
      {doc.columns
        .flatMap((column) => column.blocks)
        .filter((block) => block.visible)
        .map(
          (block) =>
            block.type === "text" && (
              <div
                key={block.id}
                className="cv-freeform-box"
                style={freeformFrameStyle(getFreeformFrame(block))}
              >
                <div className="cv-freeform-text" style={freeformTextStyle(block)}>
                  {block.data.content}
                </div>
              </div>
            ),
        )}
    </div>
  );
}
