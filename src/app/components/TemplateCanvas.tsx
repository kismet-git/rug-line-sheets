"use client";

import { useMemo } from "react";

import { ImageSlot } from "./ImageSlot";
import type { TemplateDefinition } from "@/templates";

type SlotState = {
  imageUrl?: string;
  name?: string;
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
  const geometry = useMemo(() => {
    if (template.slots.length === 0) {
      return {
        minX: 0,
        minY: 0,
        width: 1,
        height: 1,
      };
    }

    const minX = Math.min(...template.slots.map((slot) => slot.x));
    const minY = Math.min(...template.slots.map((slot) => slot.y));
    const maxX = Math.max(...template.slots.map((slot) => slot.x + slot.width));
    const maxY = Math.max(...template.slots.map((slot) => slot.y + slot.height));

    const width = Math.max(maxX - minX, 1);
    const height = Math.max(maxY - minY, 1);

    return {
      minX,
      minY,
      width,
      height,
    };
  }, [template.slots]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="relative w-full max-w-full"
        style={{
          aspectRatio: `${geometry.width}/${geometry.height}`,
        }}
      >
        {template.slots.map((slot, index) => {
          const left = ((slot.x - geometry.minX) / geometry.width) * 100;
          const top = ((slot.y - geometry.minY) / geometry.height) * 100;
          const width = (slot.width / geometry.width) * 100;
          const height = (slot.height / geometry.height) * 100;
          const captionPercent = slot.height
            ? (slot.captionHeight / slot.height) * 100
            : 0;

          const state = slots[index];

          return (
            <div
              key={slot.id}
              className="absolute"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
            >
              <ImageSlot
                index={index}
                imageUrl={state?.imageUrl}
                name={state?.name}
                caption={state?.caption ?? ""}
                captionHeightPercent={captionPercent}
                onImageChange={onImageChange}
                onClearImage={onClearImage}
                onCaptionChange={onCaptionChange}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
