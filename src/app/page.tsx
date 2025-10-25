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
import Image from "next/image";
import { useCallback, useEffect, useMemo, useReducer, useId } from "react";
import { TemplateCanvas } from "./components/TemplateCanvas";
import { maxSlots, templates, type TemplateDefinition } from "./templates";

type SlotState = {
  imageUrl?: string;
  caption: string;
  name?: string;
};

type BuilderState = {
  title: string;
  templateId: string;
  slots: SlotState[];
};

type Action =
  | { type: "setTitle"; title: string }
  | { type: "setTemplate"; templateId: string }
  | { type: "setImage"; index: number; payload: { url: string; name: string } }
  | { type: "clearImage"; index: number }
  | { type: "setCaption"; index: number; caption: string };

const initialState: BuilderState = {
  title: "Collection Title",
  templateId: templates[0].id,
  slots: Array.from({ length: maxSlots }, () => ({ caption: "" })),
};

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case "setTitle":
      return { ...state, title: action.title };
    case "setTemplate":
      return { ...state, templateId: action.templateId };
    case "setImage": {
      const slots = state.slots.map((slot, index) =>
        index === action.index
          ? { ...slot, imageUrl: action.payload.url, name: action.payload.name }
          : slot,
      );
      return { ...state, slots };
    }
    case "clearImage": {
      const slots = state.slots.map((slot, index) =>
        index === action.index
          ? { caption: slot.caption }
          : slot,
      );
      return { ...state, slots };
    }
    case "setCaption": {
      const slots = state.slots.map((slot, index) =>
        index === action.index ? { ...slot, caption: action.caption } : slot,
      );
      return { ...state, slots };
    }
    default:
      return state;
  }
}

function findTemplate(templateId: string): TemplateDefinition {
  return templates.find((template) => template.id === templateId) ?? templates[0];
}

export default function Home() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const collectionTitleLabelId = useId();
  const templateFieldId = useId();

  const activeTemplate = useMemo(
    () => findTemplate(state.templateId),
    [state.templateId],
  );

  const filledSlotCount = useMemo(
    () => state.slots.filter((slot) => Boolean(slot.imageUrl)).length,
    [state.slots],
  );

  const suggestedTemplate = useMemo(() => {
    if (filledSlotCount === 0) {
      return activeTemplate;
    }
    return (
      templates.find((template) => template.slotCount >= filledSlotCount) ??
      templates[templates.length - 1]
    );
  }, [activeTemplate, filledSlotCount]);

  useEffect(() => {
    if (filledSlotCount === 0) return;
    const current = activeTemplate;
    if (filledSlotCount > current.slotCount) {
      if (suggestedTemplate.id !== current.id) {
        dispatch({ type: "setTemplate", templateId: suggestedTemplate.id });
      }
    }
  }, [activeTemplate, dispatch, filledSlotCount, suggestedTemplate]);

  const visibleSlots = useMemo(
    () => state.slots.slice(0, activeTemplate.slotCount),
    [state.slots, activeTemplate.slotCount],
  );

  const handleTitleChange = useCallback(
    (title: string) => {
      dispatch({ type: "setTitle", title });
    },
    [dispatch],
  );

  const handleTemplateChange = useCallback(
    (templateId: string) => {
      dispatch({ type: "setTemplate", templateId });
    },
    [dispatch],
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 print:bg-white">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-6 py-10 print:max-w-none print:px-0 print:py-0">
        <header className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-wide text-neutral-800">
              Gertmanian Line Sheet Builder
            </h1>
            <p className="text-sm text-neutral-500">
              Upload rugs, enter captions, pick a layout, then print to PDF.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-700"
            >
              Print / Save PDF
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl print:rounded-none print:bg-transparent print:p-0 print:shadow-none">
          <div className="grid gap-4 print:hidden md:grid-cols-[minmax(0,_1fr)_minmax(0,_220px)] md:items-end">
            <label className="flex flex-col gap-2">
              <span
                id={collectionTitleLabelId}
                className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500"
              >
                Collection Title
              </span>
              <input
                type="text"
                value={state.title}
                onChange={(event) => handleTitleChange(event.target.value)}
                maxLength={60}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-lg font-semibold uppercase tracking-[0.2em] text-neutral-800 outline-none focus:border-neutral-400"
                aria-labelledby={collectionTitleLabelId}
              />
            </label>
            <div className="flex flex-col gap-2">
              <label
                className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500"
                htmlFor={templateFieldId}
              >
                Template
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={activeTemplate.id}
                  onChange={(event) => handleTemplateChange(event.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium uppercase tracking-wide text-neutral-700 outline-none focus:border-neutral-400"
                  id={templateFieldId}
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.label}
                    </option>
                  ))}
                </select>
                {suggestedTemplate.id !== activeTemplate.id ? (
                  <button
                    type="button"
                    onClick={() => handleTemplateChange(suggestedTemplate.id)}
                    className="whitespace-nowrap rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-800"
                  >
                    Use {suggestedTemplate.label}
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-[16in] max-w-full overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl transition print:w-[16in] print:border-0 print:bg-transparent print:shadow-none">
              <div className="flex h-[10in] w-full flex-col px-[0.75in] pt-[0.75in] pb-[0.65in] print:h-[10in]">
                <input
                  type="text"
                  value={state.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  maxLength={60}
                  className="mx-auto w-full max-w-[12in] bg-transparent text-center text-4xl font-semibold uppercase tracking-[0.32em] text-neutral-800 outline-none placeholder:text-neutral-300 focus-visible:ring-0"
                  placeholder="Collection Title"
                  aria-labelledby={collectionTitleLabelId}
                />
                <div className="flex flex-1 flex-col pt-[0.5in]">
                  <div className="h-full w-full">
                    <TemplateCanvas
                      template={activeTemplate}
                      slots={visibleSlots}
                      onImageChange={(index, file) =>
                        dispatch({ type: "setImage", index, payload: file })
                      }
                      onClearImage={(index) =>
                        dispatch({ type: "clearImage", index })
                      }
                      onCaptionChange={(index, caption) =>
                        dispatch({ type: "setCaption", index, caption })
                      }
                    />
                  </div>
                  <div className="flex justify-center pt-[0.45in]">
                    <Image
                      src="/gertmanian-logo.svg"
                      alt="Gertmanian"
                      width={220}
                      height={72}
                      className="pointer-events-none w-[2.3in] max-w-[320px]"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
