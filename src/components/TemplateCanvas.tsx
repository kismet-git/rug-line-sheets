"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { TemplateDefinition } from "@/templates";

export interface SlotData {
  imageUrl?: string;
  caption?: string;
}

interface TemplateCanvasProps {
  template: TemplateDefinition;
  slots: SlotData[];
}

export function TemplateCanvas({ template, slots }: TemplateCanvasProps) {
  const slotContents = useMemo(() => {
    return template.slots.map((slot, index) => ({
      slot,
      index,
      content: slots[index] ?? { caption: undefined, imageUrl: undefined },
    }));
  }, [slots, template]);

  return (
    <div className="w-full">
      <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <div
          className="relative h-full w-full"
          style={{
            aspectRatio: `${template.printableWidth}/${template.printableHeight}`,
          }}
        >
          <div className="absolute inset-0">
            {slotContents.map(({ slot, content, index }) => {
              const left = (slot.x / template.printableWidth) * 100;
              const top = (slot.y / template.printableHeight) * 100;
              const width = (slot.width / template.printableWidth) * 100;
              const height = (slot.height / template.printableHeight) * 100;
              const captionPercent = slot.height
                ? (slot.captionHeight / slot.height) * 100
                : 0;

              return (
                <div
                  key={slot.id}
                  className="absolute flex flex-col overflow-hidden bg-white"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                  }}
                >
                  <div className="relative flex-1 bg-white">
                    {content.imageUrl ? (
                      <Image
                        alt={content.caption ?? "Uploaded artwork"}
                        src={content.imageUrl}
                        fill
                        className="object-cover"
                        sizes="100%"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-xs text-zinc-500">
                        <span className="font-medium uppercase tracking-wide">Empty Slot</span>
                        <span>Add an image to fill this space.</span>
                      </div>
                    )}
                  </div>
                  <div
                    className="flex items-center justify-center bg-white px-4 text-[0.62rem] font-semibold uppercase tracking-[0.32em] text-black [line-height:1.2]"
                    style={{
                      flex: `0 0 ${captionPercent}%`,
                    }}
                  >
                    <span className="truncate">{content.caption ?? `Caption ${index + 1}`}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateCanvas;
