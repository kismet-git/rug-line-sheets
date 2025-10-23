"use client";

import Image from "next/image";
import { useRef, useState } from "react";

type Props = {
  index: number;
  imageUrl?: string;
  caption: string;
  onImageChange: (index: number, file: { url: string; name: string }) => void;
  onClearImage: (index: number) => void;
  onCaptionChange: (index: number, caption: string) => void;
};

export function ImageSlot({
  index,
  imageUrl,
  caption,
  onImageChange,
  onClearImage,
  onCaptionChange,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    onImageChange(index, { url, name: file.name });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? [];
    if (!file) return;
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    handleFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const [file] = Array.from(event.dataTransfer.files);
    if (!file) return;
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    handleFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const related = event.relatedTarget as Node | null;
    if (related && event.currentTarget.contains(related)) {
      return;
    }
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const clearImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    onClearImage(index);
  };

  return (
    <div className="group relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-neutral-300 bg-white shadow-sm print:border-neutral-200">
      <div
        className={`relative flex flex-1 cursor-pointer flex-col items-center justify-center bg-neutral-50 transition-colors ${
          isDragging ? "border-2 border-dashed border-blue-400" : ""
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Rug ${index + 1}`}
            fill
            sizes="100%"
            className="object-contain"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-6 text-center text-sm text-neutral-500">
            <span className="font-medium text-neutral-600">Drop rug photo</span>
            <span>or click to upload</span>
          </div>
        )}
        {imageUrl ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              clearImage();
            }}
            className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-700 shadow-sm transition hover:bg-white"
          >
            Remove
          </button>
        ) : null}
      </div>
      <label className="flex items-center border-t border-neutral-200 bg-white px-3">
        <span className="sr-only">Caption for rug {index + 1}</span>
        <input
          type="text"
          value={caption}
          onChange={(event) => onCaptionChange(index, event.target.value)}
          placeholder="Caption"
          className="h-10 w-full bg-transparent text-sm font-medium uppercase tracking-wide text-neutral-800 outline-none placeholder:text-neutral-400"
          maxLength={60}
        />
      </label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
