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
import { cn } from "~/lib/utils";
import ReactMarkdown from "react-markdown";

export function Game() {
  const noice = useNoiceStore();
  const game = useNoiceStore((g) => g.game!);
  const question = useNoiceStore(
    (g) => g.game!.questions[game.questionIndex].question
  );
  const [letter, setLetter] = useState<string | null>(null);

  function submitAnswer() {}

  return (
    <div className="flex flex-col gap-4 w-full max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto items-stretch bg-[#f9f9f9] rounded-xl sm:rounded-3xl p-3 sm:p-6 border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      {/* Header with Duolingo-style progress bar and lives */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center mb-1 sm:mb-2">
          <div className="text-base sm:text-xl font-extrabold">
            Questão {game.questionIndex + 1}/{game.questions.length}
          </div>
          <div className="flex items-center gap-1">
            {[...Array(game.lives)].map((_, i) => (
              <div key={i} className="text-lg sm:text-2xl">
                ❤️
              </div>
            ))}
            {[...Array(3 - game.lives)].map((_, i) => (
              <div
                key={i + game.lives}
                className="text-lg sm:text-2xl opacity-30"
              >
                ❤️
              </div>
            ))}
          </div>
        </div>

        <Progress
          value={((game.questionIndex + 1) / game.questions.length) * 100}
          className="h-2 sm:h-3 bg-gray-200 border border-black sm:border-2 rounded-full"
        />
      </div>

      {/* Question content */}
      <div className="flex flex-col gap-3 sm:gap-5 bg-white rounded-lg sm:rounded-2xl border-2 sm:border-4 border-black p-3 sm:p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-base sm:text-lg font-semibold text-center w-full">
          <ReactMarkdown>{question.context}</ReactMarkdown>
        </p>
        <p className="text-lg sm:text-xl font-bold my-1 sm:my-2 text-center w-full">
          <ReactMarkdown>{question.alternativesIntroduction}</ReactMarkdown>
        </p>

        <div className="flex flex-col gap-2 sm:gap-3 mt-2 sm:mt-3">
          {question.alternatives.map((alternative, index) => (
            <button
              key={index}
              onClick={() => setLetter(alternative.letter)}
              className={cn(
                "flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl text-left border-2 sm:border-4 border-black transition-all",
                "hover:translate-y-[-1px] sm:hover:translate-y-[-2px] active:translate-y-[1px] sm:active:translate-y-[2px]",
                letter === alternative.letter
                  ? "bg-[#ddf4ff] border-[#1cb0f6] shadow-[2px_2px_0px_0px_rgba(28,176,246,1)] sm:shadow-[4px_4px_0px_0px_rgba(28,176,246,1)]"
                  : "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50"
              )}
            >
              <div
                className={cn(
                  "flex justify-center items-center w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-3 sm:mr-4 text-base sm:text-lg font-bold",
                  letter === alternative.letter
                    ? "bg-[#1cb0f6] text-white"
                    : "bg-gray-100 text-black border border-black sm:border-2"
                )}
              >
                {alternative.letter}
              </div>
              <span className="text-base sm:text-lg">{alternative.text}</span>
            </button>
          ))}
        </div>
      </div>

      <Drawer>
        <DrawerTrigger asChild>
          <button
            onClick={submitAnswer}
            disabled={!letter}
            className={cn(
              "mt-1 sm:mt-2 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black font-extrabold text-lg sm:text-xl mx-auto",
              !letter
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#58cc02] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#46a302] hover:translate-y-[-1px] sm:hover:translate-y-[-2px] active:translate-y-[1px] sm:active:translate-y-[2px] transition-all"
            )}
          >
            VERIFICAR
          </button>
        </DrawerTrigger>

        <DrawerContent className="border-t-2 sm:border-t-4 border-black bg-[#f9f9f9]">
          <DrawerHeader className="border-b border-gray-200 sm:border-b-2 px-3 sm:px-6">
            <DrawerTitle className="text-xl sm:text-2xl font-extrabold">
              {question.title} - {question.discipline}
            </DrawerTitle>

            <DrawerDescription className="mt-3 sm:mt-4">
              {question.correctAlternative === letter ? (
                <div className="bg-[#d7ffb8] border-2 sm:border-4 border-[#58cc02] rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-4 shadow-[2px_2px_0px_0px_rgba(88,204,2,1)] sm:shadow-[4px_4px_0px_0px_rgba(88,204,2,1)]">
                  <div className="bg-[#58cc02] text-white text-xl sm:text-3xl p-1 sm:p-2 rounded-full">
                    ✓
                  </div>
                  <p className="text-[#58cc02] font-extrabold text-lg sm:text-xl">
                    Correto! 🎉
                  </p>
                </div>
              ) : (
                <div className="bg-[#ffebeb] border-2 sm:border-4 border-[#ff4b4b] rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-4 shadow-[2px_2px_0px_0px_rgba(255,75,75,1)] sm:shadow-[4px_4px_0px_0px_rgba(255,75,75,1)]">
                  <div className="bg-[#ff4b4b] text-white text-xl sm:text-3xl p-1 sm:p-2 rounded-full">
                    ✗
                  </div>
                  <p className="text-[#ff4b4b] font-extrabold text-lg sm:text-xl">
                    Incorreto! 😢
                  </p>
                </div>
              )}
            </DrawerDescription>
          </DrawerHeader>
          <CardFooter className="px-3 sm:px-6">
            <div className="flex flex-col gap-3 sm:gap-4 w-full items-stretch mt-3 sm:mt-4">
              <div className="bg-white rounded-lg sm:rounded-xl border-2 sm:border-4 border-black p-3 sm:p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-base sm:text-lg mb-1 sm:mb-2 font-bold">
                  Resposta correta:
                </p>
                <div className="p-2 sm:p-3 bg-[#d7ffb8] rounded-md sm:rounded-lg border border-[#58cc02] sm:border-2 font-bold">
                  {question.correctAlternative}
                </div>

                {letter !== question.correctAlternative && (
                  <>
                    <p className="text-base sm:text-lg mt-3 sm:mt-4 mb-1 sm:mb-2 font-bold">
                      Sua resposta:
                    </p>
                    <div className="p-2 sm:p-3 bg-[#ffebeb] rounded-md sm:rounded-lg border border-[#ff4b4b] sm:border-2 font-bold">
                      {letter}
                    </div>
                  </>
                )}
              </div>

              <button
                className="mt-2 sm:mt-4 py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-[#58cc02] text-white border-2 sm:border-4 border-black font-extrabold text-lg sm:text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#46a302] hover:translate-y-[-1px] sm:hover:translate-y-[-2px] active:translate-y-[1px] sm:active:translate-y-[2px] transition-all"
                onClick={() => {
                  // Here you would add logic to continue to next question
                }}
              >
                CONTINUAR
              </button>
            </div>
          </CardFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
