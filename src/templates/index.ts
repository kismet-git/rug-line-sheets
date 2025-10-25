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

const SIDE_MARGIN = 60;
const TITLE_AREA_HEIGHT = 280;
const FOOTER_AREA_HEIGHT = 320;
const HORIZONTAL_GAP = 24;
const VERTICAL_GAP = 42;
const CAPTION_HEIGHT = 90;
const IMAGE_ASPECT_RATIO = 1.35;

interface LayoutSpec {
  id: string;
  name: string;
  description: string;
  rows: number[];
}

function createTemplate({ id, name, description, rows }: LayoutSpec): TemplateDefinition {
  const slotCount = rows.reduce((total, count) => total + count, 0);
  const maxColumns = Math.max(...rows, 1);

  const availableWidth =
    PRINTABLE_WIDTH - SIDE_MARGIN * 2 - HORIZONTAL_GAP * Math.max(maxColumns - 1, 0);
  const slotWidthByWidth = availableWidth / maxColumns;

  const interiorHeight = PRINTABLE_HEIGHT - TITLE_AREA_HEIGHT - FOOTER_AREA_HEIGHT;
  const totalVerticalGaps = VERTICAL_GAP * Math.max(rows.length - 1, 0);
  const slotHeightFromHeight = (interiorHeight - totalVerticalGaps) / rows.length;
  const slotWidthFromHeight = (slotHeightFromHeight - CAPTION_HEIGHT) / IMAGE_ASPECT_RATIO;

  const rawSlotWidth =
    Math.min(slotWidthByWidth, slotWidthFromHeight) > 0
      ? Math.min(slotWidthByWidth, slotWidthFromHeight)
      : slotWidthByWidth;
  const slotWidth = Number(rawSlotWidth.toFixed(2));
  const imageHeight = Number((slotWidth * IMAGE_ASPECT_RATIO).toFixed(2));
  const slotHeight = Number((imageHeight + CAPTION_HEIGHT).toFixed(2));

  const totalSlotHeight = slotHeight * rows.length + totalVerticalGaps;
  const availableSlotAreaHeight = interiorHeight;
  const startY = Number(
    (
      TITLE_AREA_HEIGHT +
      Math.max((availableSlotAreaHeight - totalSlotHeight) / 2, 0)
    ).toFixed(2),
  );

  const gridWidth = slotWidth * maxColumns + HORIZONTAL_GAP * Math.max(maxColumns - 1, 0);
  const gridStartX = Number(
    ((PRINTABLE_WIDTH - gridWidth) / 2).toFixed(2),
  );

  const slots: TemplateSlot[] = [];
  let slotIndex = 0;

  rows.forEach((columns, rowIndex) => {
    const remainingColumns = maxColumns - columns;
    const baseStartX =
      gridStartX + ((slotWidth + HORIZONTAL_GAP) * Math.max(remainingColumns, 0)) / 2;
    const y = Number((startY + rowIndex * (slotHeight + VERTICAL_GAP)).toFixed(2));

    for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
      const x = Number(
        (baseStartX + columnIndex * (slotWidth + HORIZONTAL_GAP)).toFixed(2),
      );

      slotIndex += 1;
      slots.push({
        id: `${id}-slot-${slotIndex}`,
        x,
        y,
        width: slotWidth,
        height: slotHeight,
        captionHeight: CAPTION_HEIGHT,
      });
    }
  });

  return {
    id,
    name,
    description,
    printableWidth: PRINTABLE_WIDTH,
    printableHeight: PRINTABLE_HEIGHT,
    slotCount,
    slots,
  };
}

const layoutSpecs: LayoutSpec[] = [
  {
    id: "one-up",
    name: "1-Up Full Page",
    description: "A single hero rug with centered caption.",
    rows: [1],
  },
  {
    id: "two-up",
    name: "2-Up Side-by-Side",
    description: "Two evenly sized rugs in a single row.",
    rows: [2],
  },
  {
    id: "three-up",
    name: "3-Up Horizontal Row",
    description: "Three uniform rugs in one row.",
    rows: [3],
  },
  {
    id: "four-up",
    name: "4-Up 2×2 Grid",
    description: "Two rows of two evenly sized rugs.",
    rows: [2, 2],
  },
  {
    id: "five-up",
    name: "5-Up Staggered",
    description: "Three rugs on top with two centered below.",
    rows: [3, 2],
  },
  {
    id: "six-up",
    name: "6-Up 3×2 Grid",
    description: "Two rows of three rugs with tight spacing.",
    rows: [3, 3],
  },
  {
    id: "seven-up",
    name: "7-Up Staggered",
    description: "Four rugs up top with three centered below.",
    rows: [4, 3],
  },
  {
    id: "eight-up",
    name: "8-Up 4×2 Grid",
    description: "Two rows of four evenly sized rugs.",
    rows: [4, 4],
  },
  {
    id: "nine-up",
    name: "9-Up 3×3 Grid",
    description: "Three rows of three rugs.",
    rows: [3, 3, 3],
  },
  {
    id: "ten-up",
    name: "10-Up 5×2 Grid",
    description: "Two rows of five rugs with minimal gutters.",
    rows: [5, 5],
  },
];

export const templates: TemplateDefinition[] = layoutSpecs.map((spec) => createTemplate(spec));

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
