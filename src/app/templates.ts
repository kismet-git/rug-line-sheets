export type TemplateDefinition = {
  id: string;
  label: string;
  slotCount: number;
  gridTemplateColumns: string;
  gridTemplateRows: string;
  areaRows: string[];
};

export const templates: TemplateDefinition[] = [
  {
    id: "one-up",
    label: "1-Up Full Page",
    slotCount: 1,
    gridTemplateColumns: "1fr",
    gridTemplateRows: "1fr",
    areaRows: ["slot1"],
  },
  {
    id: "two-up",
    label: "2-Up Side-by-Side",
    slotCount: 2,
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "1fr",
    areaRows: ["slot1 slot2"],
  },
  {
    id: "three-up",
    label: "3-Up Horizontal Row",
    slotCount: 3,
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "1fr",
    areaRows: ["slot1 slot2 slot3"],
  },
  {
    id: "four-up",
    label: "4-Up 2×2 Grid",
    slotCount: 4,
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    areaRows: ["slot1 slot2", "slot3 slot4"],
  },
  {
    id: "five-up",
    label: "5-Up Compact",
    slotCount: 5,
    gridTemplateColumns: "repeat(6, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    areaRows: [
      "slot1 slot1 slot2 slot2 slot3 slot3",
      "slot4 slot4 slot4 slot5 slot5 slot5",
    ],
  },
  {
    id: "six-up",
    label: "6-Up 3×2 Grid",
    slotCount: 6,
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    areaRows: ["slot1 slot2 slot3", "slot4 slot5 slot6"],
  },
  {
    id: "seven-up",
    label: "7-Up (4 top, 3 bottom)",
    slotCount: 7,
    gridTemplateColumns: "repeat(8, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    areaRows: [
      "slot1 slot1 slot2 slot2 slot3 slot3 slot4 slot4",
      ". slot5 slot5 slot6 slot6 slot7 slot7 .",
    ],
  },
  {
    id: "eight-up",
    label: "8-Up 4×2 Grid",
    slotCount: 8,
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    areaRows: [
      "slot1 slot2 slot3 slot4",
      "slot5 slot6 slot7 slot8",
    ],
  },
  {
    id: "nine-up",
    label: "9-Up 3×3 Grid",
    slotCount: 9,
    gridTemplateColumns: "repeat(3, 1fr)",
    gridTemplateRows: "repeat(3, 1fr)",
    areaRows: [
      "slot1 slot2 slot3",
      "slot4 slot5 slot6",
      "slot7 slot8 slot9",
    ],
  },
  {
    id: "ten-up",
    label: "10-Up 5×2 Grid",
    slotCount: 10,
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(2, 1fr)",
    areaRows: [
      "slot1 slot2 slot3 slot4 slot5",
      "slot6 slot7 slot8 slot9 slot10",
    ],
  },
];

export const maxSlots = templates.reduce(
  (max, template) => Math.max(max, template.slotCount),
  0,
);

export const slotAreaLookup = templates.reduce<Record<string, string[]>>(
  (acc, template) => {
    const slotAreas: string[] = [];
    template.areaRows.forEach((row) => {
      row.split(" ").forEach((area) => {
        if (area === ".") {
          return;
        }
        if (!slotAreas.includes(area)) {
          slotAreas.push(area);
        }
      });
    });
    acc[template.id] = slotAreas;
    return acc;
  },
  {},
);
