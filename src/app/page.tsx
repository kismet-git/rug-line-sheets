"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import TemplateCanvas from "./components/TemplateCanvas";
import { TEMPLATE_DEFINITIONS, TEMPLATE_MAP, TemplateId } from "./templates";
import type { BuilderState, SlotData } from "./types";

const STORAGE_KEY = "rug-line-sheet-state";

const createEmptySlots = (count: number): SlotData[] =>
  Array.from({ length: count }, () => ({ imageObjectUrl: null, caption: "" }));

const normalizeSlots = (slots: SlotData[], desiredLength: number): SlotData[] => {
  if (slots.length === desiredLength) {
    return slots;
  }

  if (slots.length > desiredLength) {
    return slots.slice(0, desiredLength);
  }

  const additional = createEmptySlots(desiredLength - slots.length);
  return [...slots, ...additional];
};

const defaultTemplateId: TemplateId = "10-up";

const createDefaultState = (): BuilderState => ({
  collectionTitle: "",
  selectedTemplate: defaultTemplateId,
  showCaptions: true,
  slots: createEmptySlots(TEMPLATE_MAP[defaultTemplateId].slotCount)
});

export default function HomePage() {
  const [state, setState] = useState<BuilderState>(() => createDefaultState());
  const [isHydrated, setIsHydrated] = useState(false);

  const selectedTemplate = useMemo(
    () => TEMPLATE_MAP[state.selectedTemplate],
    [state.selectedTemplate]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BuilderState;
        const templateId = parsed.selectedTemplate in TEMPLATE_MAP ? parsed.selectedTemplate : defaultTemplateId;
        const template = TEMPLATE_MAP[templateId];
        const normalizedSlots = normalizeSlots(parsed.slots || [], template.slotCount).map((slot) => ({
          imageObjectUrl: slot.imageObjectUrl ?? null,
          caption: (slot.caption || "").toUpperCase()
        }));

        setState({
          collectionTitle: (parsed.collectionTitle || "").toUpperCase(),
          selectedTemplate: templateId,
          showCaptions: typeof parsed.showCaptions === "boolean" ? parsed.showCaptions : true,
          slots: normalizedSlots
        });
      }
    } catch (error) {
      console.warn("Unable to load saved state", error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, isHydrated]);

  const handleCollectionTitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setState((prev) => ({ ...prev, collectionTitle: value.toUpperCase() }));
  }, []);

  const handleTemplateChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as TemplateId;
    const template = TEMPLATE_MAP[value];
    setState((prev) => ({
      ...prev,
      selectedTemplate: value,
      slots: normalizeSlots(prev.slots, template.slotCount)
    }));
  }, []);

  const handleShowCaptionsToggle = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setState((prev) => ({ ...prev, showCaptions: checked }));
  }, []);

  const handleImageChange = useCallback((index: number, dataUrl: string | null) => {
    setState((prev) => {
      const nextSlots = [...prev.slots];
      nextSlots[index] = { ...nextSlots[index], imageObjectUrl: dataUrl };
      return { ...prev, slots: nextSlots };
    });
  }, []);

  const handleCaptionChange = useCallback((index: number, value: string) => {
    setState((prev) => {
      const nextSlots = [...prev.slots];
      nextSlots[index] = { ...nextSlots[index], caption: value.toUpperCase() };
      return { ...prev, slots: nextSlots };
    });
  }, []);

  const handleClearAll = useCallback(() => {
    const resetState = createDefaultState();
    setState(resetState);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") {
      window.print();
    }
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 pb-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8">
        <div className="print:hidden rounded-2xl bg-white p-6 shadow-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-1 flex-col gap-4">
              <label className="text-sm font-semibold uppercase tracking-widest text-slate-600" htmlFor="collectionTitle">
                Collection Title
              </label>
              <input
                id="collectionTitle"
                type="text"
                value={state.collectionTitle}
                onChange={handleCollectionTitleChange}
                placeholder="Enter collection title"
                className="rounded-md border border-slate-200 px-4 py-3 text-base font-semibold uppercase tracking-[0.18em] text-gertBlue shadow-sm focus:border-gertBlue focus:outline-none focus:ring-2 focus:ring-gertBlue/40"
              />
            </div>
            <div className="flex flex-col gap-4 md:w-56">
              <label className="text-sm font-semibold uppercase tracking-widest text-slate-600" htmlFor="templateSelect">
                Template
              </label>
              <select
                id="templateSelect"
                value={state.selectedTemplate}
                onChange={handleTemplateChange}
                className="rounded-md border border-slate-200 px-3 py-3 text-sm font-medium uppercase tracking-[0.14em] text-slate-700 shadow-sm focus:border-gertBlue focus:outline-none focus:ring-2 focus:ring-gertBlue/40"
              >
                {TEMPLATE_DEFINITIONS.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-slate-600">
              <input
                type="checkbox"
                checked={state.showCaptions}
                onChange={handleShowCaptionsToggle}
                className="h-4 w-4 rounded border-slate-300 text-gertBlue focus:ring-gertBlue"
              />
              Show captions
            </label>
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-2 text-sm font-semibold uppercase tracking-widest text-slate-600 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center rounded-full bg-gertBlue px-6 py-2 text-sm font-semibold uppercase tracking-widest text-white shadow-lg transition hover:bg-[#005479]"
            >
              Print / Save PDF
            </button>
          </div>
        </div>
        <TemplateCanvas
          collectionTitle={state.collectionTitle}
          template={selectedTemplate}
          slots={normalizeSlots(state.slots, selectedTemplate.slotCount)}
          showCaptions={state.showCaptions}
          onImageChange={handleImageChange}
          onCaptionChange={handleCaptionChange}
        />
      </div>
    </main>
  );
}
