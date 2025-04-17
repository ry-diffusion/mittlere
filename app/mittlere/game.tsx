import { useNoiceStore } from "@libs/stores";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { CardFooter } from "~/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Progress } from "~/components/ui/progress";
import ReactMarkdown from "react-markdown";
import { cn } from "~/lib/utils";

export function Game() {
  const noice = useNoiceStore();
  const game = useNoiceStore((g) => g.game!);
  const question = useNoiceStore(
    (g) => g.game!.questions[game.questionIndex].question
  );
  const [letter, setLetter] = useState<string | null>(null);

  function submitAnswer() {
    if (!letter) return;
    const isCorrect = letter === question.correctAlternative;
    if (!isCorrect) {
      noice.missQuestion();
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-full mx-auto items-stretch bg-[#f9f9f9] rounded-lg sm:rounded-xl p-2 sm:p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      {/* Compact header with progress bar and lives */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="text-sm font-extrabold flex items-center gap-1">
          <span className="bg-[#58cc02] text-white px-2 py-1 rounded-md border border-black">
            {game.questionIndex + 1}/{game.questions.length}
          </span>
        </div>

        <div className="flex-grow mx-2">
          <Progress
            value={((game.questionIndex + 1) / game.questions.length) * 100}
            className="h-2 bg-gray-200 border border-black rounded-full"
          />
        </div>

        <div className="flex items-center">
          {[...Array(game.lives)].map((_, i) => (
            <div key={i} className="text-base sm:text-lg">
              ❤️
            </div>
          ))}
          {[...Array(3 - game.lives)].map((_, i) => (
            <div
              key={i + game.lives}
              className="text-base sm:text-lg opacity-30"
            >
              ❤️
            </div>
          ))}
        </div>
      </div>

      {/* Question content - prioritized */}
      <div className="flex flex-col gap-2 bg-white rounded-md border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        {/* Question content - bold and visible */}
        <p className="font-semibold text-sm sm:text-base">
          <ReactMarkdown>{question.context}</ReactMarkdown>
        </p>
        <p className="font-bold text-base sm:text-lg">
          <ReactMarkdown>{question.alternativesIntroduction}</ReactMarkdown>
        </p>

        {/* Answer options - compact but clear */}
        <div className="flex flex-col gap-2 mt-2">
          {question.alternatives.map((alternative, index) => (
            <button
              key={index}
              onClick={() => setLetter(alternative.letter)}
              className={cn(
                "flex items-center p-2 sm:p-3 rounded-md text-left border-2 border-black transition-all",
                "hover:translate-y-[-1px] active:translate-y-[1px]",
                letter === alternative.letter
                  ? "bg-[#ddf4ff] border-[#1cb0f6] shadow-[2px_2px_0px_0px_rgba(28,176,246,1)]"
                  : "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50"
              )}
            >
              <div
                className={cn(
                  "flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-full mr-2 text-sm sm:text-base font-bold shrink-0",
                  letter === alternative.letter
                    ? "bg-[#1cb0f6] text-white"
                    : "bg-gray-100 text-black border border-black"
                )}
              >
                {alternative.letter}
              </div>
              <span className="text-sm sm:text-base">
                <ReactMarkdown>{alternative.text}</ReactMarkdown>
                {alternative.file && (
                  <img
                    src={alternative.file}
                    alt="Alternative"
                    className="mt-2"
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit button - centered and prominent */}
      <Drawer
        onClose={() => {
          setLetter(null);
          noice.nextQuestion();
        }}
      >
        <DrawerTrigger asChild>
          <button
            onClick={submitAnswer}
            disabled={!letter}
            className={cn(
              "py-2 sm:py-3 px-4 sm:px-5 rounded-lg border-2 border-black font-extrabold text-base sm:text-lg mx-auto",
              !letter
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#58cc02] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#46a302] hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
            )}
          >
            VERIFICAR
          </button>
        </DrawerTrigger>

        <DrawerContent className="border-t-2 border-black bg-[#f9f9f9]">
          <DrawerHeader className="border-b border-gray-200 px-3">
            <DrawerTitle className="text-lg sm:text-xl font-extrabold">
              {question.title} - {question.discipline}
            </DrawerTitle>

            <DrawerDescription className="mt-2">
              {question.correctAlternative === letter ? (
                <div className="bg-[#d7ffb8] border-2 border-[#58cc02] rounded-md p-2 sm:p-3 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(88,204,2,1)]">
                  <div className="bg-[#58cc02] text-white text-base sm:text-xl p-1 rounded-full">
                    ✓
                  </div>
                  <p className="text-[#58cc02] font-extrabold text-base sm:text-lg">
                    Correto! 🎉
                  </p>
                </div>
              ) : (
                <div className="bg-[#ffebeb] border-2 border-[#ff4b4b] rounded-md p-2 sm:p-3 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(255,75,75,1)]">
                  <div className="bg-[#ff4b4b] text-white text-base sm:text-xl p-1 rounded-full">
                    ✗
                  </div>
                  <p className="text-[#ff4b4b] font-extrabold text-base sm:text-lg">
                    Incorreto! 😢
                  </p>
                </div>
              )}
            </DrawerDescription>
          </DrawerHeader>
          <CardFooter className="px-3">
            <div className="flex flex-col gap-2 w-full items-stretch mt-2">
              <div className="bg-white rounded-md border-2 border-black p-2 sm:p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2">
                  <p className="text-sm sm:text-base font-bold">
                    Resposta correta:
                  </p>
                  <div className="p-1 sm:p-2 bg-[#d7ffb8] rounded-md border border-[#58cc02] font-bold text-sm sm:text-base">
                    {question.correctAlternative}
                  </div>
                </div>

                {letter !== question.correctAlternative && (
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-sm sm:text-base font-bold">
                      Sua resposta:
                    </p>
                    <div className="p-1 sm:p-2 bg-[#ffebeb] rounded-md border border-[#ff4b4b] font-bold text-sm sm:text-base">
                      {letter}
                    </div>
                  </div>
                )}
              </div>

              <button className="py-2 sm:py-3 px-4 sm:px-5 rounded-lg bg-[#58cc02] text-white border-2 border-black font-extrabold text-base sm:text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#46a302] hover:translate-y-[-1px] active:translate-y-[1px] transition-all w-full">
                CONTINUAR
              </button>
            </div>
          </CardFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
