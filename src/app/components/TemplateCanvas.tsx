"use client";

import { ImageSlot } from "./ImageSlot";
import type { TemplateDefinition } from "../templates";
import { slotAreaLookup } from "../templates";

type SlotState = {
  imageUrl?: string;
  caption: string;
};

type Props = {
  template: TemplateDefinition;
  slots: SlotState[];
  onImageChange: (index: number, file: { url: string; name: string }) => void;
  onClearImage: (index: number) => void;
  onCaptionChange: (index: number, caption: string) => void;
};

export function TemplateCanvas({
  template,
  slots,
  onImageChange,
  onClearImage,
  onCaptionChange,
}: Props) {
  const gridTemplateAreas = template.areaRows
    .map((row) => `"${row}"`)
    .join(" ");

  const slotAreas = slotAreaLookup[template.id];
  const gapSize = template.slotCount >= 6 ? "0.25in" : "0.4in";

  return (
    <div
      className="grid h-full w-full"
      style={{
        gridTemplateColumns: template.gridTemplateColumns,
        gridTemplateRows: template.gridTemplateRows,
        gridTemplateAreas,
        gap: gapSize,
      }}
    >
      {slots.map((slot, index) => (
        <div
          key={index}
          style={{ gridArea: slotAreas[index] ?? `slot${index + 1}` }}
        >
          <ImageSlot
            index={index}
            imageUrl={slot.imageUrl}
            caption={slot.caption}
            onImageChange={onImageChange}
            onClearImage={onClearImage}
            onCaptionChange={onCaptionChange}
          />
        </div>
      ))}
    </div>
  );
}
