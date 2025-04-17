import Exams from "@libs/exams.json";
import path from "path";
import fs from "fs";

// Types for discipline and language
export interface Discipline {
  label: string;
  value: string;
}

export interface Language {
  label: string;
  value: string;
}

// Type for an ENEM exam
export interface EnemExam {
  title: string;
  year: number;
  disciplines: Discipline[];
  languages?: Language[];
  questions: {
    title: string;
    index: number;
    discipline: string;
    language?: string;
  }[];
}

// Index type: year -> EnemExam
export type EnemExamIndex = Record<number, EnemExam>;

/**
 * Indexes ENEM exams by year.
 * @param exams Array of ENEM exams
 * @returns An object mapping year to EnemExam
 */
export function indexEnemExams(exams: EnemExam[]): EnemExamIndex {
  return exams.reduce<EnemExamIndex>((acc, exam) => {
    acc[exam.year] = exam;
    return acc;
  }, {});
}

export const allExams = Exams as EnemExam[];
export const enemIndex = indexEnemExams(Exams as EnemExam[]);

/**
 * Load exam questions data from file system
 * @param yearDir The directory containing question files for a specific year
 * @returns Object containing the structured question data
 */
export async function loadExamData(yearDir: string): Promise<{
  year: number;
  disciplines: Discipline[];
  languages: Language[];
  questions: any[];
}> {
  try {
    // Read the details.json file
    const detailsPath = path.join(yearDir, "details.json");
    const rawDetails = JSON.parse(fs.readFileSync(detailsPath, "utf8"));

    const year = parseInt(path.basename(yearDir), 10);

    // Extract data from details
    const disciplines = rawDetails.disciplines || [];
    const languages = rawDetails.languages || [];

    // Build question index
    const questions = [];

    // Find all question directories
    const questionsDir = path.join(yearDir, "questions");
    if (fs.existsSync(questionsDir)) {
      const questionIds = fs
        .readdirSync(questionsDir)
        .filter((dir) =>
          fs.statSync(path.join(questionsDir, dir)).isDirectory()
        );

      // Load basic info for each question
      for (const qId of questionIds) {
        const questionDetailsPath = path.join(
          questionsDir,
          qId,
          "details.json"
        );

        if (fs.existsSync(questionDetailsPath)) {
          try {
            const questionData = JSON.parse(
              fs.readFileSync(questionDetailsPath, "utf8")
            );

            // Normalize the data structure
            const normalizedQuestion = {
              title: questionData.title || `Questão ${qId} - ENEM ${year}`,
              index: questionData.index || parseInt(qId, 10),
              discipline: questionData.discipline || null,
              language: questionData.language || null,
              // Don't load full details here, just metadata
            };

            questions.push(normalizedQuestion);
          } catch (err) {
            console.warn(
              `Error loading question ${qId} for year ${year}:`,
              err
            );
          }
        }
      }
    }

    return { year, disciplines, languages, questions };
  } catch (error) {
    console.error(`Failed to load exam data for ${yearDir}:`, error);
    return {
      year: parseInt(path.basename(yearDir), 10),
      disciplines: [],
      languages: [],
      questions: [],
    };
  }
}
