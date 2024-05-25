import { create } from "zustand";

type Store = {
  detections: {
    detClass: string;
    confidence: number;
  }[];
  addDetection: (detection: { detClass: string; confidence: number }) => void;
};

export const useStore = create<Store>()((set) => ({
  detections: [],
  addDetection: (detection) =>
    set((state) => ({ detections: [...state.detections, detection] })),
}));
