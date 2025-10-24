"use client";

import Image from "next/image";
import { useEffect, useMemo, useReducer } from "react";
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
  }, [activeTemplate, filledSlotCount, suggestedTemplate]);

  const visibleSlots = useMemo(
    () => state.slots.slice(0, activeTemplate.slotCount),
    [state.slots, activeTemplate.slotCount],
  );

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
              onClick={() => window.print()}
              className="rounded-full bg-neutral-900 px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-700"
            >
              Print / Save PDF
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl print:rounded-none print:bg-transparent print:p-0 print:shadow-none">
          <div className="grid gap-4 print:hidden md:grid-cols-[minmax(0,_1fr)_minmax(0,_220px)] md:items-end">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                Collection Title
              </span>
              <input
                type="text"
                value={state.title}
                onChange={(event) =>
                  dispatch({ type: "setTitle", title: event.target.value })
                }
                maxLength={60}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-lg font-semibold uppercase tracking-[0.2em] text-neutral-800 outline-none focus:border-neutral-400"
              />
            </label>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                Template
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  value={activeTemplate.id}
                  onChange={(event) =>
                    dispatch({ type: "setTemplate", templateId: event.target.value })
                  }
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium uppercase tracking-wide text-neutral-700 outline-none focus:border-neutral-400"
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
                    onClick={() =>
                      dispatch({ type: "setTemplate", templateId: suggestedTemplate.id })
                    }
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
                  onChange={(event) =>
                    dispatch({ type: "setTitle", title: event.target.value })
                  }
                  maxLength={60}
                  className="mx-auto w-full max-w-[12in] bg-transparent text-center text-4xl font-semibold uppercase tracking-[0.32em] text-neutral-800 outline-none placeholder:text-neutral-300 focus-visible:ring-0"
                  placeholder="Collection Title"
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
