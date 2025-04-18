import { useNoiceStore } from "@libs/stores";
import { useState } from "react";
import { Button } from "@components/ui/button";
import { Progress } from "@components/ui/progress";
import ReactMarkdown from "react-markdown";
import { useStore } from "@libs/stores";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@components/ui/drawer";
import { CardFooter } from "@components/ui/card";
import { cn } from "@/lib/utils";

export function PlayingGame() {
  const noice = useNoiceStore();
  const game = useNoiceStore((g) => g.game!);
  const question = useNoiceStore(
    (g) => g.game!.questions[game.questionIndex].question
  );
  const [letter, setLetter] = useState<string | null>(null);

  const [reviewMode, setReviewMode] = useState(false);

  function submitAnswer() {
    if (!letter) return;
    const isCorrect = letter === question.correctAlternative;

    if (!isCorrect) {
      noice.missQuestion();
    }

    noice.setCurrentQuestionState(isCorrect ? "correct" : "incorrect");
  }

  function goNext() {
    if (reviewMode) {
      setLetter(null);
      setReviewMode(false);
      return;
    }

    noice.nextQuestion();
  }

  function review() {
    setReviewMode(true);
  }

  return (
    <div className="flex flex-col gap-3 w-full max-w-full mx-auto items-stretch bg-[#f9f9f9] rounded-lg sm:rounded-xl p-2 sm:p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative">
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
            className="h-8"
          />
        </div>

        <div className="flex items-center">
          {[...Array(game.lives)].map((_, i) => (
            <div key={i} className="text-base sm:text-lg">
              ❤️
            </div>
          ))}
          {[...Array(game.maxLives - game.lives)].map((_, i) => (
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
                  : "bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50",
                noice.isCurrentQuestionAnswered() &&
                  alternative.letter === question.correctAlternative &&
                  "bg-blue-500 text-white",
                noice.isCurrentQuestionAnswered() &&
                  alternative.letter !== question.correctAlternative &&
                  alternative.letter === letter &&
                  "bg-[#ff4b4b] text-white"
              )}
            >
              <div
                className={cn(
                  "flex justify-center items-center w-7 h-7 sm:w-8 sm:h-8 rounded-full mr-2 text-sm sm:text-base font-bold shrink-0",
                  letter === alternative.letter
                    ? "bg-[#1cb0f6] text-white"
                    : "bg-gray-100 text-black border border-black",
                  noice.isCurrentQuestionAnswered() &&
                    alternative.letter === question.correctAlternative &&
                    "bg-blue-500 text-white",
                  noice.isCurrentQuestionAnswered() &&
                    alternative.letter !== question.correctAlternative &&
                    alternative.letter === letter &&
                    "bg-[#ff4b4b] text-white"
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

      {/* Drawer para verificação de respostas e feedback - estilo Duolingo */}
      <Drawer>
        {!noice.isCurrentQuestionAnswered() ? (
          <DrawerTrigger asChild>
            <button
              onClick={submitAnswer}
              disabled={!letter}
              className={cn(
                "py-2 sm:py-3 px-4 sm:px-5 rounded-lg border-2 border-black font-extrabold text-base sm:text-lg fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50",
                !letter
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#58cc02] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#46a302] hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
              )}
            >
              VERIFICAR
            </button>
          </DrawerTrigger>
        ) : (
          <button
            onClick={goNext}
            className="py-2 sm:py-3 px-4 sm:px-5 rounded-lg bg-[#58cc02] text-white border-2 border-black font-extrabold text-base sm:text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#46a302] hover:translate-y-[-1px] active:translate-y-[1px] transition-all fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            CONTINUAR
          </button>
        )}

        <DrawerContent className="border-t-2 border-black bg-[#f9f9f9]">
          <DrawerHeader className="border-b border-gray-200 px-3">
            <DrawerTitle className="text-lg sm:text-xl font-extrabold">
              {question.title} - {question.discipline}
            </DrawerTitle>

            <DrawerDescription className="mt-2">
              {question.correctAlternative === letter ? (
                <div className="bg-[#d7ffb8] border-2 border-[#58cc02] rounded-md p-2 sm:p-3 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(88,204,2,1)]">
                  <div className="bg-[#58cc02] text-white text-base sm:text-xl p-1 rounded-full w-8 text-center">
                    ✓
                  </div>
                  <p className="text-[#58cc02] font-extrabold text-base sm:text-lg">
                    Correto! 🎉
                  </p>
                </div>
              ) : (
                <div className="bg-[#ffebeb] border-2 border-[#ff4b4b] rounded-md p-2 sm:p-3 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(255,75,75,1)]">
                  <div className="bg-[#ff4b4b] text-white text-base sm:text-xl p-1 rounded-full w-8 text-center">
                    ✗
                  </div>
                  <p className="text-[#ff4b4b] font-extrabold text-base sm:text-lg">
                    Incorreto! 😢
                  </p>
                </div>
              )}
            </DrawerDescription>
          </DrawerHeader>

          <CardFooter className="px-3 mb-8">
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

              <DrawerClose asChild>
                <button
                  onClick={goNext}
                  className="py-2 sm:py-3 px-4 sm:px-5 rounded-lg bg-[#58cc02] text-white border-2 border-black font-extrabold text-base sm:text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#46a302] hover:translate-y-[-1px] active:translate-y-[1px] transition-all w-full"
                >
                  CONTINUAR
                </button>
              </DrawerClose>

              {!reviewMode && (
                <DrawerClose asChild>
                  <Button
                    variant="neutral"
                    className="sm:py-3 px-4 sm:px-5"
                    onClick={review}
                  >
                    Revisar
                  </Button>
                </DrawerClose>
              )}
            </div>
          </CardFooter>
        </DrawerContent>
      </Drawer>

      {/* Informações da revisão */}
      {noice.isCurrentQuestionAnswered() && reviewMode && (
        <div className="mt-4 bg-white rounded-md border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="mb-3">
            {question.correctAlternative === letter ? (
              <div className="bg-[#d7ffb8] border-2 border-[#58cc02] rounded-md p-2 sm:p-3 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(88,204,2,1)]">
                <div className="bg-[#58cc02] text-white text-base sm:text-xl p-1 rounded-full w-8 text-center">
                  ✓
                </div>
                <p className="text-[#58cc02] font-extrabold text-base sm:text-lg">
                  Correto! 🎉
                </p>
              </div>
            ) : (
              <div className="bg-[#ffebeb] border-2 border-[#ff4b4b] rounded-md p-2 sm:p-3 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(255,75,75,1)]">
                <div className="bg-[#ff4b4b] text-white text-base sm:text-xl p-1 rounded-full w-8 text-center">
                  ✗
                </div>
                <p className="text-[#ff4b4b] font-extrabold text-base sm:text-lg">
                  Incorreto! 😢
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-md border-2 border-gray-300 p-2 sm:p-3 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.1)]">
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
                <p className="text-sm sm:text-base font-bold">Sua resposta:</p>
                <div className="p-1 sm:p-2 bg-[#ffebeb] rounded-md border border-[#ff4b4b] font-bold text-sm sm:text-base">
                  {letter}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GameFinished() {
  const noice = useNoiceStore();
  const store = useStore();
  const game = useNoiceStore((g) => g.game!);
  const accuracy = noice.getAcurracy();
  const startTime = useNoiceStore((g) => g.gameStartedAt);
  const endTime = new Date();
  const gameTimeInSeconds = startTime
    ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    : 0;

  // Formata o tempo em minutos e segundos
  const minutes = Math.floor(gameTimeInSeconds / 60);
  const seconds = gameTimeInSeconds % 60;
  const formattedTime = `${minutes}m ${seconds}s`;

  // Calcula o número de respostas corretas
  const correctAnswers =
    game?.questions.filter((q) => q.state === "correct").length || 0;
  const totalQuestions = game?.questions.length || 0;

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto items-stretch bg-[#f9f9f9] rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
      {/* Cabeçalho com título e troféu/parabéns */}
      <div className="flex flex-col items-center justify-center gap-2 mb-4">
        {game.lives != 0 && (
          <>
            <div className="text-5xl mb-2">🏆</div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-center">
              Exercício Concluído!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 text-center">
              {game && game.lives > 0
                ? `Você completou com ${game.lives} ❤️ restante${game.lives > 1 ? "s" : ""}!`
                : "Você usou todas as suas vidas!"}
            </p>
          </>
        )}

        {game.lives == 0 && (
          <>
            <div className="text-5xl mb-2">😢</div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-center">
              Não foi hoje!
            </h2>
            <p className="text-sm sm:text-base text-gray-600 text-center">
              Você usou todas as suas vidas!
            </p>
          </>
        )}
      </div>

      {/* Cartão com as estatísticas */}
      <div className="bg-white rounded-md border-2 border-black p-3 sm:p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="font-bold text-lg mb-4 text-center">Seu desempenho</h3>

        {/* Grade de estatísticas */}
        <div className="grid grid-cols-2 gap-3">
          {/* Precisão */}
          <div className="flex flex-col items-center bg-[#e5f8d8] p-3 rounded-md border border-[#58cc02]">
            <span className="text-sm font-medium text-gray-600">Precisão</span>
            <span className="text-xl font-extrabold text-[#58cc02]">
              {accuracy.toFixed(0)}%
            </span>
          </div>

          {/* Respostas corretas */}
          <div className="flex flex-col items-center bg-[#ddf4ff] p-3 rounded-md border border-[#1cb0f6]">
            <span className="text-sm font-medium text-gray-600">Acertos</span>
            <span className="text-xl font-extrabold text-[#1cb0f6]">
              {correctAnswers}/{totalQuestions}
            </span>
          </div>

          {/* Tempo */}
          <div className="flex flex-col items-center bg-[#f0f0f0] p-3 rounded-md border border-gray-400">
            <span className="text-sm font-medium text-gray-600">Tempo</span>
            <span className="text-xl font-extrabold text-gray-700">
              {formattedTime}
            </span>
          </div>

          {/* Vidas restantes */}
          <div className="flex flex-col items-center bg-[#ffebeb] p-3 rounded-md border border-[#ff4b4b]">
            <span className="text-sm font-medium text-gray-600">Vidas</span>
            <span className="text-xl font-extrabold text-[#ff4b4b]">
              {game?.lives || 0}/{game?.maxLives || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Mensagem motivacional baseada no desempenho */}
      <div className="bg-white rounded-md border-2 border-black p-3 sm:p-4 mt-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <p className="text-center font-medium">
          {accuracy >= 80
            ? "Parabéns! Seu desempenho foi excelente! 🎉"
            : accuracy >= 60
              ? "Bom trabalho! Continue praticando para melhorar! 👍"
              : "Continue praticando para melhorar seu desempenho! 💪"}
        </p>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col gap-3 mt-2">
        <button
          onClick={() => store.goPreparing()}
          className="py-3 px-5 rounded-lg bg-[#58cc02] text-white border-2 border-black font-extrabold text-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#46a302] hover:translate-y-[-1px] active:translate-y-[1px] transition-all mx-auto w-full"
        >
          É isso.
        </button>
      </div>
    </div>
  );
}

export function Game() {
  const noice = useNoiceStore();
  return (
    <>
      {noice.gameState === "playing" && <PlayingGame />}
      {noice.gameState === "finished" && <GameFinished />}
    </>
  );
}
