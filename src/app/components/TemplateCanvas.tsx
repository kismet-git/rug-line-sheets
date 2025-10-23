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

  return (
    <div
      className="grid h-full w-full gap-[0.35in]"
      style={{
        gridTemplateColumns: template.gridTemplateColumns,
        gridTemplateRows: template.gridTemplateRows,
        gridTemplateAreas,
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
