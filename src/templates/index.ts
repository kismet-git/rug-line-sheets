export interface TemplateSlot {
  /** Absolute X coordinate (in pixels) relative to the printable canvas origin. */
  x: number;
  /** Absolute Y coordinate (in pixels) relative to the printable canvas origin. */
  y: number;
  /** Slot width in pixels. */
  width: number;
  /** Slot height in pixels (including the caption area). */
  height: number;
  /** Caption height in pixels reserved at the bottom of the slot. */
  captionHeight: number;
  /** Stable identifier for mapping slot content. */
  id: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  slotCount: number;
  printableWidth: number;
  printableHeight: number;
  slots: TemplateSlot[];
}

export const PRINTABLE_WIDTH = 2550;
export const PRINTABLE_HEIGHT = 3300;

const MARGIN = 180; // 0.75" margins around the printable area.
const GUTTER = 60; // Consistent spacing between slots.
const CAPTION_HEIGHT = 200; // Reserved caption space per slot.

function createSingleSlotTemplate(id: string, name: string, description: string): TemplateDefinition {
  const width = PRINTABLE_WIDTH - MARGIN * 2;
  const height = PRINTABLE_HEIGHT - MARGIN * 2;

  return {
    id,
    name,
    description,
    printableWidth: PRINTABLE_WIDTH,
    printableHeight: PRINTABLE_HEIGHT,
    slotCount: 1,
    slots: [
      {
        id: `${id}-slot-1`,
        x: MARGIN,
        y: MARGIN,
        width,
        height,
        captionHeight: CAPTION_HEIGHT,
      },
    ],
  };
}

function createTwoVerticalTemplate(id: string, name: string, description: string): TemplateDefinition {
  const width = PRINTABLE_WIDTH - MARGIN * 2;
  const totalHeight = PRINTABLE_HEIGHT - MARGIN * 2;
  const slotHeight = (totalHeight - GUTTER) / 2;

  return {
    id,
    name,
    description,
    printableWidth: PRINTABLE_WIDTH,
    printableHeight: PRINTABLE_HEIGHT,
    slotCount: 2,
    slots: [
      {
        id: `${id}-slot-1`,
        x: MARGIN,
        y: MARGIN,
        width,
        height: slotHeight,
        captionHeight: CAPTION_HEIGHT,
      },
      {
        id: `${id}-slot-2`,
        x: MARGIN,
        y: MARGIN + slotHeight + GUTTER,
        width,
        height: slotHeight,
        captionHeight: CAPTION_HEIGHT,
      },
    ],
  };
}

function createGridTemplate(id: string, name: string, description: string): TemplateDefinition {
  const width = PRINTABLE_WIDTH - MARGIN * 2;
  const columnWidth = (width - GUTTER) / 2;
  const topRowHeight = (PRINTABLE_HEIGHT - MARGIN * 2 - GUTTER * 2) * 0.4;
  const bottomRowHeight = PRINTABLE_HEIGHT - MARGIN * 2 - topRowHeight - GUTTER * 2;

  return {
    id,
    name,
    description,
    printableWidth: PRINTABLE_WIDTH,
    printableHeight: PRINTABLE_HEIGHT,
    slotCount: 3,
    slots: [
      {
        id: `${id}-slot-1`,
        x: MARGIN,
        y: MARGIN,
        width: columnWidth,
        height: topRowHeight,
        captionHeight: CAPTION_HEIGHT,
      },
      {
        id: `${id}-slot-2`,
        x: MARGIN + columnWidth + GUTTER,
        y: MARGIN,
        width: columnWidth,
        height: topRowHeight,
        captionHeight: CAPTION_HEIGHT,
      },
      {
        id: `${id}-slot-3`,
        x: MARGIN,
        y: MARGIN + topRowHeight + GUTTER,
        width,
        height: bottomRowHeight,
        captionHeight: CAPTION_HEIGHT,
      },
    ],
  };
}

export const templates: TemplateDefinition[] = [
  createSingleSlotTemplate(
    "single-feature",
    "Feature Image",
    "A single full-bleed hero image with caption",
  ),
  createTwoVerticalTemplate(
    "stacked-showcase",
    "Stacked Showcase",
    "Two vertically stacked images with shared margins",
  ),
  createGridTemplate(
    "gallery-three",
    "Gallery Trio",
    "Two images on top with a wide image below",
  ),
];

export const templatesById = new Map(templates.map((template) => [template.id, template]));

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return templatesById.get(id);
}

export function getRecommendedTemplate(imageCount: number): TemplateDefinition {
  if (imageCount <= 0) {
    return templates[0];
  }

  const exactOrNext = templates.find((template) => template.slotCount >= imageCount);
  return exactOrNext ?? templates[templates.length - 1];
}
