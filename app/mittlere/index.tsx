import { useEnemStore, useNoiceStore, useStore } from "@libs/stores";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Skeleton } from "~/components/ui/skeleton";
import { Game } from "~/mittlere/game";

function QuestionIgniterYear() {
  const enem = useEnemStore();
  const store = useStore();

  if (enem.isLoadingExams) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="w-full h-[200px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (store.questionIgniter.examYear) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
      {enem.exams.map((exam) => (
        <Card
          className="w-full transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0)] border-2 border-black"
          key={exam.year}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-black">{exam.title}</CardTitle>
            <CardDescription className="font-medium">
              Disciplinas: {exam.disciplines.map((x) => x.label).join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button
                className="w-full font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black"
                onClick={() => {
                  store.setExamYear(exam.year);
                }}
              >
                Iniciar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuestionIgniterDiscipline() {
  const store = useStore();
  const enem = useEnemStore();

  if (!store.questionIgniter.examYear) return null;

  const disciplines = enem.exams.find(
    (exam) => exam.year === store.questionIgniter.examYear
  )?.disciplines;

  if (!disciplines) return null;

  function igniteGame() {
    enem.setSelectedYear(store.questionIgniter.examYear!);

    // Convert store disciplines to string array for ENEM store
    const disciplineValues = store.questionIgniter.disciplines!.map(
      (d) => d.value
    );

    enem.setSelectedDisciplines(disciplineValues);

    store.goDownloadQuestions();
  }

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0)]">
      <CardHeader>
        <CardTitle className="text-2xl font-black">
          Selecione as disciplinas
        </CardTitle>
        <CardDescription className="font-medium">
          Você pode selecionar múltiplas disciplinas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col justify-center gap-3 mb-6">
          {disciplines.map((discipline) => (
            <div
              className="flex items-center gap-3 p-3 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors"
              key={discipline.value}
            >
              <Checkbox
                id={`checkbox-${discipline.value}`}
                className="w-5 h-5 border-2 border-black"
                checked={store.hasDiscipline(discipline)}
                onCheckedChange={() => {
                  if (store.hasDiscipline(discipline)) {
                    store.removeDiscipline(discipline);
                  } else {
                    store.addDiscipline(discipline);
                  }
                }}
              />
              <Label
                htmlFor={`checkbox-${discipline.value}`}
                className="text-lg font-medium cursor-pointer w-full"
              >
                {discipline.label}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <Button
            className="font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-black"
            onClick={() => store.resetIgniter()}
          >
            Voltar
          </Button>

          <Button
            disabled={!store.isReadyToIgnite()}
            className="font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] disabled:hover:translate-x-[0px] disabled:hover:translate-y-[0px] transition-all border-2 border-black"
            onClick={igniteGame}
          >
            Iniciar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Mitlre() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 max-w-4xl text-center">
      <div className="text-6xl sm:text-7xl font-black tracking-tight pb-2 border-b-4 border-black">
        Mitlere
      </div>
      <div className="text-xl sm:text-2xl font-bold mt-2">
        O Seu Duolingo para o ENEM
      </div>
    </div>
  );
}

export function DownloadQuestions() {
  const enem = useEnemStore();
  const store = useStore();
  const noice = useNoiceStore();
  const enemQuestions = useEnemStore(s => s.questions)
  const [hasDownloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!hasDownloaded) return;

    const questions = [];
    const indexes = Object.keys(enemQuestions!);
    if (indexes.length == 0) {
      throw new Error("No questions available.");
    }

    // select 15 random questions
    for (let i = 0; i < 15; i++) {
      const randomIndex = Math.floor(Math.random() * indexes.length);
      const question = enemQuestions[indexes[randomIndex]];

      if (!question) {
        console.warn(
          `Question not found for index ${randomIndex}. retrying.., available indexes:`,
          indexes,
          enem.questions
        );
        i--;
        continue;
      }

      questions.push(enemQuestions[indexes[randomIndex]]);
    }

    console.log(questions);

    noice.initializeGame(questions);

    // Once questions are loaded, transition to playing state
    store.goPlaying();
  }, [hasDownloaded, enemQuestions]);
  

  useEffect(() => {
    const chooseRandomQuestions = async () => {
      if (enem.selectedYear && enem.selectedDisciplines.length > 0) {
        try {
          console.log(`ano enem: ${enem.selectedYear} ${enem.selectedDisciplines}`)
          // Fetch questions for all selected disciplines
          await enem.fetchQuestions(
            enem.selectedYear,
            enem.selectedDisciplines,
            enem.selectedLanguage || undefined
          );

          setDownloaded(true)

          
        } catch (error) {
          console.error("Error loading questions:", error);
          store.goPreparing();
        }
      }
    };

    chooseRandomQuestions();
  }, [store.state]);

  return (
    <>
      <Mitlre />
      <div className="text-xl font-black animate-pulse bg-black text-white py-2 px-6 rotate-1 shadow-md">
        Carregando...
      </div>
      <div className="text-sm font-bold text-gray-700 mt-2">
        Baixando questões para {enem.selectedDisciplines.length} disciplina(s)
      </div>
    </>
  );
}

export function Prepare() {
  const enem = useEnemStore();

  useEffect(() => {
    enem.fetchExams();
  }, []);

  return (
    <>
      <Mitlre />
      {enem.isLoadingExams && (
        <div className="text-xl font-black animate-pulse bg-black text-white py-2 px-6 rotate-1 shadow-md">
          Carregando...
        </div>
      )}

      <QuestionIgniterYear />
      <QuestionIgniterDiscipline />
    </>
  );
}

export function Mittlere() {
  const store = useStore();

  return (
    <main className="flex flex-col items-center justify-center px-4 pt-10 pb-16 gap-16 min-h-screen">
      {store.state === "preparing" && <Prepare />}
      {store.state === "download_questions" && <DownloadQuestions />}
      {store.state === "playing" && <Game />}
    </main>
  );
}
