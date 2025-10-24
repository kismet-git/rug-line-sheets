"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import TemplateCanvas from "@/components/TemplateCanvas";
import { getRecommendedTemplate, templates } from "@/templates";

interface UploadSlot {
  id: string;
  file: File;
  url: string;
  caption: string;
}

function filenameToCaption(name: string) {
  const withoutExtension = name.replace(/\.[^.]+$/, "");
  return withoutExtension.replace(/[-_]+/g, " ");
}

export default function Home() {
  const [uploads, setUploads] = useState<UploadSlot[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id ?? "");
  const [manualOverride, setManualOverride] = useState(false);

  const recommendedTemplate = useMemo(() => {
    return getRecommendedTemplate(uploads.length);
  }, [uploads.length]);

  const selectedTemplate = useMemo(() => {
    const fallback = templates[0];
    return templates.find((template) => template.id === selectedTemplateId) ?? fallback;
  }, [selectedTemplateId]);

  const activeTemplate =
    manualOverride && uploads.length <= selectedTemplate.slotCount ? selectedTemplate : recommendedTemplate;

  useEffect(() => {
    return () => {
      uploads.forEach((upload) => URL.revokeObjectURL(upload.url));
    };
  }, [uploads]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setUploads((previous) => {
      previous.forEach((upload) => URL.revokeObjectURL(upload.url));
      return files.map((file, index) => ({
        id: `${file.name}-${index}-${Date.now()}`,
        file,
        url: URL.createObjectURL(file),
        caption: filenameToCaption(file.name),
      }));
    });

    if (manualOverride && files.length > selectedTemplate.slotCount) {
      setManualOverride(false);
    }

    event.target.value = "";
  };

  const handleCaptionChange = (id: string, caption: string) => {
    setUploads((current) =>
      current.map((upload) =>
        upload.id === id
          ? {
              ...upload,
              caption,
            }
          : upload,
      ),
    );
  };

  const slotData = useMemo(() => {
    return activeTemplate.slots.map((_, index) => {
      const upload = uploads[index];
      return {
        imageUrl: upload?.url,
        caption: upload?.caption,
      };
    });
  }, [activeTemplate, uploads]);

  const ignoredUploads = uploads.slice(activeTemplate.slotCount);
  const usingRecommendedTemplate = activeTemplate.id === recommendedTemplate.id;

  return (
    <div className="min-h-screen bg-zinc-100 py-12">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-zinc-900">Rug Line Sheet Builder</h1>
          <p className="text-sm text-zinc-600">
            Upload images, choose a template, and preview the printable layout. Templates are scaled to stay within the
            printable canvas while keeping consistent gutters and caption heights.
          </p>
        </header>

        <section className="grid gap-6 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium text-zinc-900">
                Upload product images
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="mt-2 w-full rounded-md border border-dashed border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-700"
              />
              <p className="mt-2 text-xs text-zinc-500">Select images in the order you’d like them to appear.</p>
            </div>

            {uploads.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-zinc-900">Captions</h2>
                <div className="space-y-3">
                  {uploads.map((upload, index) => (
                    <div key={upload.id} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>Image {index + 1}</span>
                        <span className="font-mono">{upload.file.name}</span>
                      </div>
                      <input
                        type="text"
                        value={upload.caption}
                        onChange={(event) => handleCaptionChange(upload.id, event.target.value)}
                        className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800"
                        placeholder="Add a caption"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Template</h2>
                  <p className="text-xs text-zinc-600">
                    {uploads.length > 0
                      ? `Recommended: ${recommendedTemplate.name} (${recommendedTemplate.slotCount} slots)`
                      : "Select a template or upload images to get a recommendation."}
                  </p>
                </div>
                {!usingRecommendedTemplate && (
                  <button
                    type="button"
                    onClick={() => {
                      setManualOverride(false);
                    }}
                    className="rounded-full border border-transparent bg-zinc-900 px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-zinc-700"
                  >
                    Use recommended
                  </button>
                )}
              </div>

              <select
                value={selectedTemplateId}
                onChange={(event) => {
                  setSelectedTemplateId(event.target.value);
                  setManualOverride(true);
                }}
                className="mt-4 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} · {template.slotCount} slot{template.slotCount === 1 ? "" : "s"}
                  </option>
                ))}
              </select>

              <ul className="mt-4 space-y-2 text-xs text-zinc-600">
                <li>
                  Printable area: {activeTemplate.printableWidth.toLocaleString()} × {activeTemplate.printableHeight.toLocaleString()} px
                </li>
                <li>{activeTemplate.description}</li>
              </ul>
            </div>

            {manualOverride && uploads.length > selectedTemplate.slotCount && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                The selected template only supports {selectedTemplate.slotCount} image
                {selectedTemplate.slotCount === 1 ? "" : "s"}. Switch to the recommended template to show all uploads.
              </div>
            )}

            {ignoredUploads.length > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                The active template displays only the first {activeTemplate.slotCount} image
                {activeTemplate.slotCount === 1 ? "" : "s"}. {ignoredUploads.length} upload
                {ignoredUploads.length === 1 ? " is" : "s are"} hidden.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Printable preview</h2>
          <p className="text-xs text-zinc-600">
            Slots are positioned absolutely inside the printable canvas and scale responsively without exceeding the page bounds.
          </p>
          <div className="mt-6">
            <TemplateCanvas template={activeTemplate} slots={slotData} />
          </div>
        </section>
      </main>
    </div>
  );
}
