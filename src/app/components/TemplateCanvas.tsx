"use client";

import ImageSlot from "./ImageSlot";
import { SlotData } from "../types";
import { TemplateDefinition } from "../templates";

interface TemplateCanvasProps {
  collectionTitle: string;
  template: TemplateDefinition;
  slots: SlotData[];
  showCaptions: boolean;
  onImageChange: (index: number, dataUrl: string | null) => void;
  onCaptionChange: (index: number, value: string) => void;
}

const EMPTY_SLOT: SlotData = { imageObjectUrl: null, caption: "" };

export default function TemplateCanvas({
  collectionTitle,
  template,
  slots,
  showCaptions,
  onImageChange,
  onCaptionChange
}: TemplateCanvasProps) {
  const rows = template.layout;
  let slotIndex = 0;

  return (
    <section className="print-area aspect-[17/11] mx-auto w-full max-w-5xl rounded-3xl bg-white p-10 shadow-2xl print:m-0 print:max-w-none print:rounded-none print:p-8 print:shadow-none">
      <div className="flex h-full flex-col">
        <header className="brand-title text-center text-3xl font-black uppercase tracking-[0.22em] text-gertBlue">
          {collectionTitle || "Collection Title"}
        </header>
        <div className="mt-8 flex flex-1 flex-col justify-center gap-6">
          {rows.map((count, rowIndex) => {
            const items = Array.from({ length: count });
            return (
              <div
                key={`row-${rowIndex}`}
                className="grid gap-6"
                style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
              >
                {items.map((_, columnIndex) => {
                  const currentIndex = slotIndex;
                  const slot = slots[currentIndex] ?? EMPTY_SLOT;
                  slotIndex += 1;
                  return (
                    <ImageSlot
                      key={`slot-${rowIndex}-${columnIndex}`}
                      index={currentIndex}
                      slot={slot}
                      aspectRatio={template.slotAspectRatio}
                      showCaptions={showCaptions}
                      onImageChange={(dataUrl) => onImageChange(currentIndex, dataUrl)}
                      onCaptionChange={(value) => onCaptionChange(currentIndex, value)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
        <footer className="mt-6">
          <div className="flex flex-col items-center gap-3">
            <span className="block h-[3px] w-full max-w-4xl bg-gertBlue" />
            <img
              src="https://u0m9uz4r42yofjsv.public.blob.vercel-storage.com/gertmenian-logo.png"
              alt="Gertmenian"
              className="h-8 w-auto"
            />
            <span className="block h-[3px] w-full max-w-4xl bg-gertBlue" />
          </div>
        </footer>
      </div>
    </section>
  );
}
