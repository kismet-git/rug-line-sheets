import { TemplateId } from "./templates";

export interface SlotData {
  imageObjectUrl: string | null;
  caption: string;
}

export interface BuilderState {
  collectionTitle: string;
  selectedTemplate: TemplateId;
  showCaptions: boolean;
  slots: SlotData[];
}
