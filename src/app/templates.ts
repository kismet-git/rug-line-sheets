export type TemplateId =
  | "1-up"
  | "2-up"
  | "3-up"
  | "4-up"
  | "5-up"
  | "6-up"
  | "7-up"
  | "8-up"
  | "9-up"
  | "10-up";

export interface TemplateDefinition {
  id: TemplateId;
  label: string;
  layout: number[];
  slotCount: number;
  slotAspectRatio: number;
}

const slotAspectRatio = 1.35;

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  { id: "1-up", label: "1-Up", layout: [1], slotCount: 1, slotAspectRatio },
  { id: "2-up", label: "2-Up", layout: [2], slotCount: 2, slotAspectRatio },
  { id: "3-up", label: "3-Up", layout: [3], slotCount: 3, slotAspectRatio },
  { id: "4-up", label: "4-Up", layout: [2, 2], slotCount: 4, slotAspectRatio },
  { id: "5-up", label: "5-Up", layout: [3, 2], slotCount: 5, slotAspectRatio },
  { id: "6-up", label: "6-Up", layout: [3, 3], slotCount: 6, slotAspectRatio },
  { id: "7-up", label: "7-Up", layout: [4, 3], slotCount: 7, slotAspectRatio },
  { id: "8-up", label: "8-Up", layout: [4, 4], slotCount: 8, slotAspectRatio },
  { id: "9-up", label: "9-Up", layout: [3, 3, 3], slotCount: 9, slotAspectRatio },
  { id: "10-up", label: "10-Up", layout: [5, 5], slotCount: 10, slotAspectRatio }
];

export const TEMPLATE_MAP: Record<TemplateId, TemplateDefinition> = TEMPLATE_DEFINITIONS.reduce(
  (acc, template) => {
    acc[template.id] = template;
    return acc;
  },
  {} as Record<TemplateId, TemplateDefinition>
);
