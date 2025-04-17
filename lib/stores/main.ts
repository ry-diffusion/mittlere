import type { Discipline } from "@libs/libenem";
import { create } from "zustand";

export type AppState = "preparing" | "download_questions" | "playing";

export interface GlobalState {
  questionIgniter: {
    examYear?: number;
    disciplines?: Discipline[];
  };

  state: AppState;
  resetIgniter: () => void;

  setExamYear: (year: number) => void;
  setDisciplines: (disciplines: Discipline[]) => void;
  addDiscipline: (discipline: Discipline) => void;
  removeDiscipline: (discipline: Discipline) => void;
  hasDiscipline: (discipline: Discipline) => boolean;
  clearDisciplines: () => void;
  isReadyToIgnite: () => boolean;

  goDownloadQuestions: () => void;

  goPlaying: () => void;
  goPreparing: () => void;
}

export const useStore = create<GlobalState>((set, get) => ({
  state: "preparing",
  questionIgniter: {
    isReadyToIgnite: false,
    examYear: undefined,
    disciplines: undefined,
  },

  goPlaying: () => set(() => ({ state: "playing" })),
  goPreparing: () => set(() => ({ state: "preparing" })),
  goDownloadQuestions: () => set(() => ({ state: "download_questions" })),

  resetIgniter: () => {
    set(() => ({
      questionIgniter: {
        isReadyToIgnite: false,
        examYear: undefined,
        disciplines: undefined,
      },
    }));
  },

  hasDiscipline: (discipline) => {
    const { disciplines } = get().questionIgniter;
    return !!disciplines?.find((d) => d.value === discipline.value);
  },

  addDiscipline: (discipline) =>
    set((state) => ({
      questionIgniter: {
        ...state.questionIgniter,
        disciplines: [...(state.questionIgniter.disciplines || []), discipline],
      },
    })),

  removeDiscipline: (discipline) =>
    set((state) => ({
      questionIgniter: {
        ...state.questionIgniter,
        disciplines: state.questionIgniter.disciplines?.filter(
          (d) => d.value !== discipline.value
        ),
      },
    })),

  clearDisciplines: () => {
    set((state) => ({
      questionIgniter: { ...state.questionIgniter, disciplines: [] },
    }));
  },

  setExamYear: (year) =>
    set((state) => ({
      questionIgniter: { ...state.questionIgniter, examYear: year },
    })),
  setDisciplines: (disciplines) =>
    set((state) => ({
      questionIgniter: { ...state.questionIgniter, disciplines },
    })),
  isReadyToIgnite: () => {
    const { examYear, disciplines } = get().questionIgniter;
    return !!examYear && !!disciplines && disciplines.length > 0;
  },
}));
