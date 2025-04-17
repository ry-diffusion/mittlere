/// Noice - The Game State

import type { QuestionDetails } from "@libs/stores/enem-repository";
import { create } from "zustand";

export type QuestionState = "correct" | "incorrect" | "unanswered";
export type GameState = "playing" | "finished" | "waiting";

export type GameQuestion = {
  state: QuestionState;
  question: QuestionDetails;
};

export type Game = {
  // The current level of the game
  lives: number;
  questionIndex: number;
  questions: GameQuestion[];
};

export type Noice = {
  gameState: "playing" | "finished" | "waiting";
  game?: Game;
};

export type NoiceStore = {
  gameState: Noice["gameState"];
  game?: Noice["game"];
  gameStartedAt?: Date;

  nextQuestion: () => void;
  missQuestion: () => void;
  initializeGame: (questions: QuestionDetails[]) => void;
};

export const useNoiceStore = create<NoiceStore>((set) => ({
  gameState: "waiting",

  nextQuestion: () => {
    set((state) => {
      const game = state.game!;
      const nextQuestionIndex = game.questionIndex + 1;

      if (nextQuestionIndex >= game.questions.length) {
        return { gameState: "finished" };
      }

      return {
        game: {
          ...game,
          questionIndex: nextQuestionIndex,
        },
      };
    });
  },

  missQuestion: () => {
    set((state) => {
      const game = state.game!;
      const lives = game.lives - 1;

      if (lives <= 0) {
        return { gameState: "finished" };
      }

      return {
        game: {
          ...game,
          lives,
        },
      };
    });
  },

  initializeGame: (questions) => {
    if (questions.length == 0) throw new Error("No questions provided");

    const game: Game = {
      lives: 3,
      questionIndex: 0,
      questions: questions.map((question) => ({
        state: "unanswered",
        question,
      })),
    };

    set(() => ({
      gameState: "playing",
      game,
      gameStartedAt: new Date(),
    }));
  },
}));
