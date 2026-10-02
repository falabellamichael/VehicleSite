import { createContext, useContext } from "react";
import type { Vehicle } from "./data";
export type ModalState =
  | { type: "vehicle"; vehicle: Vehicle }
  | { type: "film" }
  | { type: "compare" }
  | { type: "search" }
  | null;
export interface SiteState {
  saved: string[];
  toggleSaved: (id: string) => void;
  comparison: string[];
  toggleComparison: (id: string) => void;
  clearComparison: () => void;
  setModal: (modal: ModalState) => void;
  notify: (text: string) => void;
  motion: boolean;
  setMotion: (on: boolean) => void;
}
export const SiteContext = createContext<SiteState | null>(null);
export function useSite() {
  const state = useContext(SiteContext);
  if (!state) throw new Error("Site components must be inside SiteContext.");
  return state;
}
