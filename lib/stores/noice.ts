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
  maxLives: number;
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

  setCurrentQuestionState: (state: QuestionState) => void;

  nextQuestion: () => void;
  missQuestion: () => void;
  initializeGame: (questions: QuestionDetails[]) => void;
  tryCurrentQuestionAgain: () => void; 
  isCurrentQuestionAnswered: () => boolean;
  getAcurracy: () => number;
};

export const useNoiceStore = create<NoiceStore>((set, get) => ({
  gameState: "waiting",

  isCurrentQuestionAnswered: () => {
    const game = get().game;
    if (!game) return false;

    const question = game.questions[game.questionIndex];

    return question.state !== "unanswered";
  },

  getAcurracy: () => {
    const game = get().game;
    if (!game) return 0;

    const correctAnswers = game.questions.filter(
      (question) => question.state === "correct"
    ).length;

    return (correctAnswers / game.questions.length) * 100;
  },

  tryCurrentQuestionAgain: () => {
    set((state) => {
      const game = state.game!;
      const questionIndex = game.questionIndex;
      const question = game.questions[questionIndex];

      return {
        game: {
          ...game,
          questions: [
            ...game.questions.slice(0, questionIndex),
            {
              ...question,
              state: "unanswered",
            },
            ...game.questions.slice(questionIndex + 1),
          ],
        },
      };
    }); 
  },

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

  setCurrentQuestionState: (newState: QuestionState) => {
    set((state) => {
      const game = state.game!;
      const questionIndex = game.questionIndex;
      const question = game.questions[questionIndex];

      return {
        game: {
          ...game,
          questions: [
            ...game.questions.slice(0, questionIndex),
            {
              ...question,
              state: newState,
            },
            ...game.questions.slice(questionIndex + 1),
          ],
        },
      };
    });
  },

  missQuestion: () => {
    set((state) => {
      const game = state.game!;
      const lives = game.lives - 1;

      if (lives <= 0) {
        return { gameState: "finished", game: {
          ...game,
          lives: 0,
        } };
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
      lives: 7,
      maxLives: 7,
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
