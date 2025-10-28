"use client";

import { ChangeEvent, useCallback } from "react";
import { SlotData } from "../types";

interface ImageSlotProps {
  index: number;
  slot: SlotData;
  aspectRatio: number;
  showCaptions: boolean;
  onImageChange: (dataUrl: string | null) => void;
  onCaptionChange: (value: string) => void;
}

const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ImageSlot({
  index,
  slot,
  aspectRatio,
  showCaptions,
  onImageChange,
  onCaptionChange
}: ImageSlotProps) {
  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onImageChange(dataUrl);
      } catch (error) {
        console.error("Failed to load image", error);
      }
    },
    [onImageChange]
  );

  const handleClearClick = useCallback(() => {
    onImageChange(null);
    onCaptionChange("");
  }, [onCaptionChange, onImageChange]);

  return (
    <div className="flex flex-col">
      <div
        className="relative w-full overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white"
        style={{ aspectRatio }}
      >
        {slot.imageObjectUrl ? (
          <img
            src={slot.imageObjectUrl}
            alt={`Rug ${index + 1}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 text-sm font-medium text-slate-500">
            <span>Click to upload</span>
            <span className="text-xs uppercase tracking-widest">Rug {index + 1}</span>
          </div>
        )}
        <input
          aria-label={`Upload rug image ${index + 1}`}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
      {slot.imageObjectUrl ? (
        <button
          type="button"
          onClick={handleClearClick}
          className="mt-2 self-end text-xs font-semibold uppercase text-slate-500 transition hover:text-gertBlue print:hidden"
        >
          Remove
        </button>
      ) : null}
      {showCaptions && (
        <p className="caption-text mt-2 text-center text-xs font-semibold uppercase tracking-caption text-gray-900">
          {slot.caption ? slot.caption : "\u00A0"}
        </p>
      )}
      <input
        type="text"
        value={slot.caption}
        onChange={(event) => onCaptionChange(event.target.value)}
        placeholder="Caption"
        className="mt-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-gertBlue focus:outline-none focus:ring-2 focus:ring-gertBlue/40 print:hidden"
      />
    </div>
  );
}
